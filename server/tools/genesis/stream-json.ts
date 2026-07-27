import type { Duplex } from 'node:stream';
import { parser } from 'stream-json';
import Assembler from 'stream-json/Assembler';

import { type VerifiedGenesisSource, openGenesisJsonStream } from '@/server/tools/genesis/fetch-verify';

type AsyncDuplex<T> = Duplex & AsyncIterable<T>;
type JsonToken = {
  name: string;
  value?: unknown;
};
type JsonPath = Array<string | number>;
type PathFrame =
  | { kind: 'object'; path: JsonPath; pendingKey: string | null }
  | { kind: 'array'; path: JsonPath; nextIndex: number };

const pathsEqual = (left: JsonPath, right: JsonPath): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const pathKey = (path: readonly string[]): string => path.join('\u0000');

export const consumeGenesisArray = async <T>(
  file: VerifiedGenesisSource,
  path: string,
  consume: (value: T) => void | Promise<void>,
): Promise<number> => {
  const targetPath = path.split('.');
  const input = openGenesisJsonStream(file);
  const tokenSource = parser({ packValues: true, streamValues: false });
  input.once('error', (error) => tokenSource.destroy(error));
  input.pipe(tokenSource);

  const frames: PathFrame[] = [];
  let selected = false;
  let completed = false;
  let count = 0;
  let itemAssembler: Assembler | null = null;

  const beginValue = (): JsonPath => {
    const parent = frames.at(-1);
    if (!parent) return [];
    if (parent.kind === 'array') {
      const valuePath = [...parent.path, parent.nextIndex];
      parent.nextIndex++;
      return valuePath;
    }
    if (parent.pendingKey === null) throw new Error(`JSON object value has no key while scanning ${path}`);
    const valuePath = [...parent.path, parent.pendingKey];
    parent.pendingKey = null;
    return valuePath;
  };

  try {
    for await (const token of tokenSource as AsyncDuplex<JsonToken>) {
      if (token.name === 'keyValue') {
        const frame = frames.at(-1);
        if (!frame || frame.kind !== 'object') throw new Error(`JSON key outside object while scanning ${path}`);
        if (typeof token.value !== 'string') throw new Error(`JSON key is not a string while scanning ${path}`);
        frame.pendingKey = token.value;
        if (itemAssembler) itemAssembler.consume(token as { name: string; value?: string });
        continue;
      }

      if (token.name === 'startObject' || token.name === 'startArray') {
        const valuePath = beginValue();
        const directTargetItem =
          selected && valuePath.length === targetPath.length + 1 && pathsEqual(valuePath.slice(0, -1), targetPath);
        if (directTargetItem) {
          if (token.name !== 'startObject') throw new Error(`genesis array item must be an object: ${path}`);
          if (itemAssembler) throw new Error(`nested target item while scanning ${path}`);
          itemAssembler = new Assembler();
        }
        if (itemAssembler) itemAssembler.consume(token as { name: string; value?: string });

        frames.push(
          token.name === 'startObject'
            ? { kind: 'object', path: valuePath, pendingKey: null }
            : { kind: 'array', path: valuePath, nextIndex: 0 },
        );
        if (token.name === 'startArray' && pathsEqual(valuePath, targetPath)) selected = true;
        continue;
      }

      if (token.name === 'endObject' || token.name === 'endArray') {
        if (itemAssembler) {
          itemAssembler.consume(token as { name: string; value?: string });
          if (itemAssembler.done) {
            const item = itemAssembler.current as T | null;
            if (item === null) throw new Error(`genesis array item assembled to null: ${path}`);
            await consume(item);
            count++;
            itemAssembler = null;
          }
        }

        const frame = frames.pop();
        if (!frame) throw new Error(`unexpected JSON container end while scanning ${path}`);
        if (frame.kind === 'array' && pathsEqual(frame.path, targetPath)) completed = true;
        continue;
      }

      if (
        token.name === 'stringValue' ||
        token.name === 'numberValue' ||
        token.name === 'nullValue' ||
        token.name === 'trueValue' ||
        token.name === 'falseValue'
      ) {
        const valuePath = beginValue();
        if (selected && valuePath.length === targetPath.length + 1 && pathsEqual(valuePath.slice(0, -1), targetPath)) {
          throw new Error(`genesis array item must be an object: ${path}`);
        }
        if (itemAssembler) itemAssembler.consume(token as { name: string; value?: string });
      }
    }

    if (!selected) throw new Error(`required genesis array is missing: ${path}`);
    if (!completed) throw new Error(`genesis array did not terminate: ${path}`);
    return count;
  } finally {
    input.destroy();
    tokenSource.destroy();
  }
};

export const readGenesisScalarPaths = async (
  file: VerifiedGenesisSource,
  namedPaths: Readonly<Record<string, readonly string[]>>,
): Promise<Record<string, unknown>> => {
  const input = openGenesisJsonStream(file);
  const tokenSource = parser({ packValues: true, streamValues: false });
  input.once('error', (error) => tokenSource.destroy(error));
  input.pipe(tokenSource);

  const targets = new Map(Object.entries(namedPaths).map(([name, path]) => [pathKey(path), name]));
  const values: Record<string, unknown> = {};
  const frames: PathFrame[] = [];

  const beginValue = (): JsonPath => {
    const parent = frames.at(-1);
    if (!parent) return [];
    if (parent.kind === 'array') {
      const valuePath = [...parent.path, parent.nextIndex];
      parent.nextIndex++;
      return valuePath;
    }
    if (parent.pendingKey === null) throw new Error('JSON object value has no key while scanning metadata');
    const valuePath = [...parent.path, parent.pendingKey];
    parent.pendingKey = null;
    return valuePath;
  };

  try {
    for await (const token of tokenSource as AsyncDuplex<JsonToken>) {
      if (token.name === 'keyValue') {
        const frame = frames.at(-1);
        if (!frame || frame.kind !== 'object') throw new Error('JSON key outside object while scanning metadata');
        if (typeof token.value !== 'string') throw new Error('JSON key is not a string while scanning metadata');
        frame.pendingKey = token.value;
        continue;
      }

      if (token.name === 'startObject' || token.name === 'startArray') {
        const valuePath = beginValue();
        frames.push(
          token.name === 'startObject'
            ? { kind: 'object', path: valuePath, pendingKey: null }
            : { kind: 'array', path: valuePath, nextIndex: 0 },
        );
        continue;
      }

      if (token.name === 'endObject' || token.name === 'endArray') {
        if (!frames.pop()) throw new Error('unexpected JSON container end while scanning metadata');
        continue;
      }

      if (
        token.name === 'stringValue' ||
        token.name === 'numberValue' ||
        token.name === 'nullValue' ||
        token.name === 'trueValue' ||
        token.name === 'falseValue'
      ) {
        const valuePath = beginValue();
        const name = targets.get(pathKey(valuePath.map(String)));
        if (name) values[name] = token.value;
      }
    }
  } finally {
    input.destroy();
    tokenSource.destroy();
  }

  return values;
};
