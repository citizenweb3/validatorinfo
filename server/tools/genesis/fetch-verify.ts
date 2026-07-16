import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { Readable, Transform, type TransformCallback } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { fileURLToPath } from 'node:url';
import { createGunzip } from 'node:zlib';

import type { GenesisFileFormat, GenesisProfile } from '@/server/tools/genesis/profile';

const MAX_SOURCE_BYTES = 2_000_000_000;
const FETCH_TIMEOUT_MS = 30 * 60 * 1000;

type FileFingerprint = {
  device: string;
  inode: string;
  size: string;
  modifiedNanoseconds: string;
};

export type VerifiedGenesisSource = {
  sourceUrl: string;
  path: string;
  directory: string;
  format: GenesisFileFormat;
  archiveSha256: string | null;
  jsonSha256: string;
  fingerprint: FileFingerprint;
};

const fingerprintFile = async (path: string): Promise<FileFingerprint> => {
  const fileStat = await stat(path, { bigint: true });
  if (!fileStat.isFile()) throw new Error(`genesis path is not a regular file: ${path}`);

  return {
    device: fileStat.dev.toString(),
    inode: fileStat.ino.toString(),
    size: fileStat.size.toString(),
    modifiedNanoseconds: fileStat.mtimeNs.toString(),
  };
};

const fingerprintsEqual = (left: FileFingerprint, right: FileFingerprint): boolean =>
  left.device === right.device &&
  left.inode === right.inode &&
  left.size === right.size &&
  left.modifiedNanoseconds === right.modifiedNanoseconds;

const createByteLimit = (): Transform => {
  let bytes = 0;
  return new Transform({
    transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback) {
      bytes += chunk.length;
      if (bytes > MAX_SOURCE_BYTES) {
        callback(new Error(`genesis source exceeds ${MAX_SOURCE_BYTES} bytes`));
        return;
      }
      callback(null, chunk);
    },
  });
};

const asLocalPath = (source: string): string | null => {
  try {
    const url = new URL(source);
    if (url.protocol === 'file:') return fileURLToPath(url);
    return null;
  } catch {
    return resolve(source);
  }
};

const copySourceToTemp = async (source: string, destination: string): Promise<void> => {
  const localPath = asLocalPath(source);
  if (localPath) {
    await pipeline(createReadStream(localPath), createByteLimit(), createWriteStream(destination, { flags: 'wx' }));
    return;
  }

  const sourceUrl = new URL(source);
  if (sourceUrl.protocol !== 'https:' && sourceUrl.protocol !== 'http:') {
    throw new Error(`unsupported genesis source protocol: ${sourceUrl.protocol}`);
  }

  const response = await fetch(sourceUrl, {
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok || !response.body) {
    throw new Error(`genesis download failed with HTTP ${response.status}: ${sourceUrl.toString()}`);
  }

  const contentLength = response.headers.get('content-length');
  if (contentLength && Number(contentLength) > MAX_SOURCE_BYTES) {
    throw new Error(`genesis source exceeds ${MAX_SOURCE_BYTES} bytes`);
  }

  await pipeline(
    Readable.fromWeb(response.body as unknown as NodeReadableStream<Uint8Array>),
    createByteLimit(),
    createWriteStream(destination, { flags: 'wx' }),
  );
};

const calculateStreamSha256 = async (stream: Readable): Promise<string> => {
  const hash = createHash('sha256');
  for await (const chunk of stream) hash.update(chunk);
  return hash.digest('hex');
};

export const openGenesisJsonStream = (file: Pick<VerifiedGenesisSource, 'path' | 'format'>): Readable => {
  const input = createReadStream(file.path);
  if (file.format === 'json') return input;

  const gunzip = createGunzip();
  input.once('error', (error) => gunzip.destroy(error));
  return input.pipe(gunzip);
};

export const calculateFileSha256 = async (path: string): Promise<string> =>
  calculateStreamSha256(createReadStream(path));

export const calculateGenesisJsonSha256 = async (
  file: Pick<VerifiedGenesisSource, 'path' | 'format'>,
): Promise<string> => calculateStreamSha256(openGenesisJsonStream(file));

const verifyHashes = async (
  profile: GenesisProfile,
  path: string,
): Promise<{ archiveSha256: string | null; jsonSha256: string }> => {
  const rawSha256 = await calculateFileSha256(path);
  if (profile.fileFormat === 'gzip' && rawSha256 !== profile.archiveSha256) {
    throw new Error(`genesis archive SHA-256 mismatch for ${profile.chainId}: ${rawSha256}`);
  }

  const jsonSha256 =
    profile.fileFormat === 'json' ? rawSha256 : await calculateGenesisJsonSha256({ path, format: profile.fileFormat });
  if (jsonSha256 !== profile.jsonSha256) {
    throw new Error(`genesis JSON SHA-256 mismatch for ${profile.chainId}: ${jsonSha256}`);
  }

  return {
    archiveSha256: profile.fileFormat === 'gzip' ? rawSha256 : null,
    jsonSha256,
  };
};

export const fetchAndVerifyGenesisSource = async (
  profile: GenesisProfile,
  source: string,
): Promise<VerifiedGenesisSource> => {
  if (!source.trim()) throw new Error(`${profile.sourceEnvName} must be a non-empty URL or local file path`);

  const directory = await mkdtemp(join(tmpdir(), `validatorinfo-${profile.chainName}-genesis-`));
  const sourceName = basename(asLocalPath(source) ?? new URL(source).pathname) || 'genesis';
  const path = join(directory, sourceName);

  try {
    await copySourceToTemp(source, path);
    const before = await fingerprintFile(path);
    const hashes = await verifyHashes(profile, path);
    const after = await fingerprintFile(path);
    if (!fingerprintsEqual(before, after)) {
      throw new Error(`genesis temp file changed while it was verified: ${path}`);
    }

    return {
      sourceUrl: source,
      path,
      directory,
      format: profile.fileFormat,
      archiveSha256: hashes.archiveSha256,
      jsonSha256: hashes.jsonSha256,
      fingerprint: after,
    };
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
};

export const assertVerifiedGenesisSourceUnchanged = async (
  profile: GenesisProfile,
  file: VerifiedGenesisSource,
): Promise<void> => {
  const current = await fingerprintFile(file.path);
  if (!fingerprintsEqual(file.fingerprint, current)) {
    throw new Error(`verified genesis temp file changed before persistence: ${file.path}`);
  }

  const hashes = await verifyHashes(profile, file.path);
  if (hashes.archiveSha256 !== file.archiveSha256 || hashes.jsonSha256 !== file.jsonSha256) {
    throw new Error(`verified genesis temp file identity changed before persistence: ${file.path}`);
  }
};

export const cleanupVerifiedGenesisSource = async (file: VerifiedGenesisSource): Promise<void> => {
  await rm(file.directory, { recursive: true, force: true });
};
