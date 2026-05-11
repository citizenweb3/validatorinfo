import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import Link from 'next/link';

import CopyButton from '@/components/common/copy-button';
import { ChainWithParams } from '@/services/chain-service';
import { CosmosTxEvent } from '@/services/cosmos-indexer-api';
import TxService from '@/services/tx-service';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

interface KV {
  label: string;
  value: string;
}

const ADDRESS_PREFIXES = ['cosmos1', 'cosmosvaloper1', 'cosmospub1', 'cosmosvalconspub1'];

const SKIP_KEYS = new Set(['@type']);

const isAddress = (v: string): boolean => ADDRESS_PREFIXES.some((p) => v.startsWith(p));

const shortTypeUrl = (typeUrl: string): string => {
  const trimmed = typeUrl.replace(/^\//, '');
  const segments = trimmed.split('.');
  return segments[segments.length - 1] || trimmed;
};

const formatCoin = (v: Record<string, unknown>): string | null => {
  if (typeof v.amount === 'string' && typeof v.denom === 'string') {
    return `${v.amount} ${v.denom}`;
  }
  return null;
};

const stringifyValue = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') {
    const coin = formatCoin(v as Record<string, unknown>);
    if (coin) return coin;
    if (Array.isArray(v)) {
      const coins = v
        .map((x) => (typeof x === 'object' && x !== null ? formatCoin(x as Record<string, unknown>) : null))
        .filter((s): s is string => !!s);
      if (coins.length === v.length && coins.length > 0) return coins.join(', ');
    }
    return JSON.stringify(v);
  }
  return String(v);
};

const messageToFields = (value: Record<string, unknown>): KV[] =>
  Object.entries(value)
    .filter(([k]) => !SKIP_KEYS.has(k))
    .map(([k, v]) => ({ label: k, value: stringifyValue(v) }));

const parseAttributes = (raw: unknown): KV[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((a): a is Record<string, unknown> => typeof a === 'object' && a !== null)
    .map((a) => ({ label: String(a.key ?? ''), value: String(a.value ?? '') }));
};

const groupEventsByMsgIndex = (events: CosmosTxEvent[]): Map<number, CosmosTxEvent[]> => {
  const grouped = new Map<number, CosmosTxEvent[]>();
  events.forEach((event) => {
    const list = grouped.get(event.msg_index) ?? [];
    list.push(event);
    grouped.set(event.msg_index, list);
  });
  return grouped;
};

const FieldRow: FC<KV & { chainName: string }> = ({ label, value, chainName }) => {
  const linkHref = isAddress(value) ? `/networks/${chainName}/address/${value}/passport` : null;

  return (
    <div className="flex border-b border-bgSt last:border-b-0">
      <div className="flex w-40 flex-shrink-0 items-center border-r border-bgSt px-4 py-2 font-sfpro text-sm text-white/60">
        {label}
      </div>
      <div className="flex flex-1 items-center gap-2 px-4 py-2">
        {linkHref ? (
          <Link href={linkHref} className="break-all font-handjet text-base text-highlight hover:underline">
            {value}
          </Link>
        ) : (
          <span className="break-all font-handjet text-base">{value || '—'}</span>
        )}
        {value && <CopyButton value={value} size="md" />}
      </div>
    </div>
  );
};

const EventCard: FC<{ event: CosmosTxEvent; chainName: string }> = ({ event, chainName }) => {
  const attrs = parseAttributes(event.attributes);

  return (
    <div className="flex flex-col border-t border-bgSt">
      <div className="flex items-center justify-between border-b border-bgSt bg-bgHover/40 px-4 py-2">
        <span className="font-sfpro text-sm uppercase tracking-wider text-white/60">{event.event_type}</span>
        <span className="font-sfpro text-sm text-white/40">event #{event.event_index}</span>
      </div>
      {attrs.length > 0 && (
        <div className="flex flex-col">
          {attrs.map((attr, i) => (
            <FieldRow key={`${attr.label}-${i}`} label={attr.label} value={attr.value} chainName={chainName} />
          ))}
        </div>
      )}
    </div>
  );
};

const ExpandedCosmosTxInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('TxInformationPage');

  if (!chain) return null;

  const result = await TxService.getCosmosTxByHash(hash);

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="font-sfpro text-lg">{t('tx not found')}</div>
        <div className="font-sfpro text-base text-gray-400">{t('tx not found hint')}</div>
      </div>
    );
  }

  const tx = result.data;
  const messages = tx.messages ?? [];
  const events = tx.events ?? [];
  const eventsByMsgIndex = groupEventsByMsgIndex(events);
  const orphanEvents = events.filter((e) => !messages.some((m) => m.msg_index === e.msg_index));

  return (
    <div className="mb-5 mt-5">
      <div className="mt-4 flex w-full">
        <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
          {t('messages')} ({messages.length})
        </div>
        <div className="flex w-9/12 flex-col gap-4 border-b border-bgSt py-4 pl-6 pr-4">
          {messages.length === 0 ? (
            <span className="font-sfpro text-base text-white/50">{t('none')}</span>
          ) : (
            messages.map((msg) => {
              const fields = messageToFields(msg.value);
              const msgEvents = eventsByMsgIndex.get(msg.msg_index) ?? [];

              return (
                <div key={msg.msg_index} className="flex flex-col border border-bgSt bg-table_row">
                  <div className="flex items-center justify-between border-b border-bgSt bg-bgHover px-4 py-2">
                    <div className="flex items-center gap-3">
                      <span className="font-sfpro text-sm text-white/50">#{msg.msg_index}</span>
                      <span
                        className="break-all font-sfpro text-base text-white"
                        title={msg.type_url}
                      >
                        {shortTypeUrl(msg.type_url)}
                      </span>
                    </div>
                    {msg.signer && (
                      <div className="flex items-center gap-2 font-sfpro text-sm text-white/60">
                        <span className="text-white/40">signer</span>
                        <Link
                          href={`/networks/${chain.name}/address/${msg.signer}/passport`}
                          className="break-all font-handjet text-base text-highlight hover:underline"
                        >
                          {msg.signer}
                        </Link>
                        <CopyButton value={msg.signer} size="md" />
                      </div>
                    )}
                  </div>

                  {fields.length > 0 && (
                    <div className="flex flex-col">
                      {fields.map((field) => (
                        <FieldRow
                          key={field.label}
                          label={field.label}
                          value={field.value}
                          chainName={chain.name}
                        />
                      ))}
                    </div>
                  )}

                  {msgEvents.map((evt) => (
                    <EventCard
                      key={`${evt.msg_index}-${evt.event_index}`}
                      event={evt}
                      chainName={chain.name}
                    />
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>

      {orphanEvents.length > 0 && (
        <div className="mt-4 flex w-full">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('events')} ({orphanEvents.length})
          </div>
          <div className="flex w-9/12 flex-col gap-4 border-b border-bgSt py-4 pl-6 pr-4">
            {orphanEvents.map((evt) => {
              const attrs = parseAttributes(evt.attributes);

              return (
                <div
                  key={`${evt.msg_index}-${evt.event_index}`}
                  className="flex flex-col border border-bgSt bg-table_row"
                >
                  <div className="flex items-center justify-between border-b border-bgSt bg-bgHover px-4 py-2">
                    <div className="flex items-center gap-3">
                      <span className="font-sfpro text-sm text-white/50">#{evt.event_index}</span>
                      <span className="break-all font-sfpro text-base text-white">{evt.event_type}</span>
                    </div>
                    {evt.msg_index >= 0 && (
                      <span className="font-sfpro text-sm text-white/40">msg #{evt.msg_index}</span>
                    )}
                  </div>
                  {attrs.length > 0 && (
                    <div className="flex flex-col">
                      {attrs.map((attr, i) => (
                        <FieldRow
                          key={`${attr.label}-${i}`}
                          label={attr.label}
                          value={attr.value}
                          chainName={chain.name}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpandedCosmosTxInformation;
