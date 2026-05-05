import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { txExample } from '@/app/networks/[name]/tx/txExample';
import CopyButton from '@/components/common/copy-button';
import { isAztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { AztecTxEffect } from '@/services/aztec-indexer-api/types';
import { LogosTxDetail } from '@/services/logos-indexer-api';
import TxService from '@/services/tx-service';
import { ChainWithParams } from '@/services/chain-service';
import Link from 'next/link';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const ExpandedTxInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('TxInformationPage');

  if (chain?.name === 'logos-testnet') {
    const result = await TxService.getLogosTxByHash(hash);

    if (!result) {
      return (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="font-sfpro text-lg">{t('tx not found')}</div>
          <div className="font-sfpro text-base text-gray-400">{t('tx not found hint')}</div>
        </div>
      );
    }

    const tx = result.data as LogosTxDetail;
    const ops = tx.decoded?.ops ?? [];

    return (
      <div className="mb-5 mt-5">
        <div className="mt-4 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('format')}
          </div>
          <div className="flex w-9/12 items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base">
            {tx.decoded?.format ?? '—'}
          </div>
        </div>
        <div className="mt-4 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('storage gas price')}
          </div>
          <div className="flex w-9/12 items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg">
            {tx.storage_gas_price ?? 0}
          </div>
        </div>
        <div className="mt-4 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('execution gas price')}
          </div>
          <div className="flex w-9/12 items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg">
            {tx.execution_gas_price ?? 0}
          </div>
        </div>

        <div className="mt-4 flex w-full">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('operations')} ({ops.length})
          </div>
          <div className="flex w-9/12 flex-col gap-4 border-b border-bgSt py-4 pl-6 pr-4">
            {ops.length === 0 ? (
              <span className="font-sfpro text-base text-white/50">None</span>
            ) : (
              ops.map((op) => {
                const payloadFields: Array<{ label: string; value: string }> = [];
                if (op.payload?.parent) payloadFields.push({ label: 'parent', value: String(op.payload.parent) });
                if (op.payload?.signer) payloadFields.push({ label: 'signer', value: String(op.payload.signer) });
                if (op.payload?.channel_id) payloadFields.push({ label: 'channel_id', value: String(op.payload.channel_id) });

                return (
                  <div key={op.index} className="flex flex-col border border-bgSt bg-table_row">
                    <div className="flex items-center justify-between border-b border-bgSt bg-bgHover px-4 py-2">
                      <div className="flex items-baseline gap-3">
                        <span className="font-sfpro text-sm text-white/50">#{op.index}</span>
                        <span className="font-handjet text-xl text-highlight">{op.opcode_name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-sfpro text-sm text-white/60">
                        <span>opcode <span className="font-handjet text-base text-white">{op.opcode}</span></span>
                        <span className="text-white/30">·</span>
                        <span>{op.proof_type}</span>
                      </div>
                    </div>

                    {payloadFields.length > 0 && (
                      <div className="flex flex-col">
                        {payloadFields.map((field) => (
                          <div key={field.label} className="flex border-b border-bgSt last:border-b-0">
                            <div className="w-32 flex-shrink-0 border-r border-bgSt px-4 py-2 font-sfpro text-sm text-white/60">
                              {field.label}
                            </div>
                            <div className="flex flex-1 items-center gap-2 px-4 py-2">
                              <span className="break-all font-handjet text-base hover:text-highlight">{field.value}</span>
                              <CopyButton value={field.value} size="md" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {op.payload?.inscription && (
                      <div className="flex flex-col border-t border-bgSt">
                        <div className="flex items-center justify-between border-b border-bgSt bg-bgHover/40 px-4 py-2">
                          <span className="font-sfpro text-sm uppercase tracking-wider text-white/60">inscription</span>
                          <div className="flex items-center gap-3 font-sfpro text-sm text-white/60">
                            <span>
                              <span className="text-white/40">format </span>
                              <span className="font-handjet text-base text-white">{op.payload.inscription.format}</span>
                            </span>
                            <span className="text-white/30">·</span>
                            <span>
                              <span className="font-handjet text-base text-white">{op.payload.inscription.length}</span>
                              <span className="text-white/40"> bytes</span>
                            </span>
                            {op.payload.inscription.truncated && (
                              <>
                                <span className="text-white/30">·</span>
                                <span className="font-handjet text-base text-highlight">truncated</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex border-b border-bgSt last:border-b-0">
                          <div className="w-32 flex-shrink-0 border-r border-bgSt px-4 py-2 font-sfpro text-sm text-white/60">
                            hex
                          </div>
                          <div className="flex flex-1 items-start gap-2 px-4 py-2">
                            <span className="break-all font-handjet text-base">{op.payload.inscription.hex_preview}</span>
                            <CopyButton value={op.payload.inscription.hex_preview} size="md" />
                          </div>
                        </div>

                        {op.payload.inscription.ascii_fragments && op.payload.inscription.ascii_fragments.length > 0 && (
                          <div className="flex">
                            <div className="w-32 flex-shrink-0 border-r border-bgSt px-4 py-2 font-sfpro text-sm text-white/60">
                              ascii
                            </div>
                            <div className="flex flex-1 flex-col gap-1 px-4 py-2">
                              {op.payload.inscription.ascii_fragments.map((frag, fi) => (
                                <span key={fi} className="break-all font-handjet text-base text-white/85">{frag}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  if (chain && isAztecChainName(chain.name)) {
    const result = await TxService.getAztecTxByHash(hash);

    if (!result || result.status !== 'confirmed') {
      return (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="font-sfpro text-lg">{t('tx not found')}</div>
          <div className="font-sfpro text-base text-gray-400">{t('tx not found hint')}</div>
        </div>
      );
    }

    const txEffect = result.data as AztecTxEffect;

    const hexSections = [
      { title: 'note hashes', items: txEffect.noteHashes },
      { title: 'nullifiers', items: txEffect.nullifiers },
      { title: 'l2 to l1 messages', items: txEffect.l2ToL1Msgs },
    ];

    return (
      <div className="mb-5 mt-5">
        {hexSections.map((section) => (
          <div key={section.title}>
            <div className="mt-4 flex w-full hover:bg-bgHover">
              <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
                {t(section.title as 'note hashes')} ({section.items.length})
              </div>
              <div className="flex w-9/12 flex-col gap-1 border-b border-bgSt py-4 pl-6 pr-4">
                {section.items.length === 0 ? (
                  <span className="font-sfpro text-base text-white/50">None</span>
                ) : (
                  section.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="break-all font-handjet text-lg hover:text-highlight">{item}</span>
                      <CopyButton value={item} size="md" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Private Logs — structured objects with fields */}
        <div className="mt-4 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('private logs')} ({txEffect.privateLogs.length})
          </div>
          <div className="flex w-9/12 flex-col gap-2 border-b border-bgSt py-4 pl-6 pr-4">
            {txEffect.privateLogs.length === 0 ? (
              <span className="font-sfpro text-base text-white/50">None</span>
            ) : (
              txEffect.privateLogs.map((log, logIdx) => (
                <div key={logIdx} className="flex flex-col gap-1 rounded border border-bgSt p-2">
                  <span className="font-sfpro text-sm text-white/50">Log #{logIdx} ({log.fields.length} fields)</span>
                  {log.fields.map((field, fieldIdx) => (
                    <div key={fieldIdx} className="flex items-center gap-2">
                      <span className="break-all font-handjet text-lg hover:text-highlight">{field}</span>
                      <CopyButton value={field} size="md" />
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Public Logs — structured objects with contractAddress and fields */}
        <div className="mt-4 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('public logs')} ({txEffect.publicLogs.length})
          </div>
          <div className="flex w-9/12 flex-col gap-2 border-b border-bgSt py-4 pl-6 pr-4">
            {txEffect.publicLogs.length === 0 ? (
              <span className="font-sfpro text-base text-white/50">None</span>
            ) : (
              txEffect.publicLogs.map((log, logIdx) => (
                <div key={logIdx} className="flex flex-col gap-1 rounded border border-bgSt p-2">
                  <div className="flex items-center gap-2">
                    <span className="font-sfpro text-sm text-white/50">Contract:</span>
                    <span className="break-all font-handjet text-sm hover:text-highlight">{log.contractAddress}</span>
                    <CopyButton value={log.contractAddress} size="md" />
                  </div>
                  {log.fields.map((field, fieldIdx) => (
                    <div key={fieldIdx} className="flex items-center gap-2">
                      <span className="break-all font-handjet text-lg hover:text-highlight">{field}</span>
                      <CopyButton value={field} size="md" />
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Non-Aztec: existing Cosmos mock data
  const formatData = (title: string, data: number | string | string[]) => {
    switch (title) {
      case 'amount':
        return <div className="font-handjet text-lg hover:text-highlight">{data} {chain?.params?.denom ?? 'ATOM'}</div>;
      case 'delegate address':
        return (
          <div className="flex flex-row items-center gap-2 hover:text-highlight">
            <Link href={`/networks/${chain?.name}/address/${data}/passport`} className="text-highlight hover:underline">
              {data}
            </Link>
            <CopyButton value={data as string} size="md" />
          </div>
        );
      case 'validator address':
        if (Array.isArray(data) && data.length > 1) {
          const address = data[0];
          const valName = data[1];
          return (
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center gap-2">
                <Link href={`/networks/${chain?.name}/address/${address}/passport`} className="text-highlight hover:underline">
                  {address}
                </Link>
                <CopyButton value={address} size="md" />
              </div>
              <Link href={`/validators?search=${encodeURIComponent(valName)}`} className="text-highlight hover:underline">
                {valName}
              </Link>
            </div>
          );
        } else {
          return (
            <div className="flex flex-row items-center gap-2">
              <Link href={`/networks/${chain?.name}/address/${data}/passport`} className="text-highlight hover:underline">
                {data}
              </Link>
              <CopyButton value={data as string} size="md" />
            </div>
          );
        }
      case 'auto claim reward':
        return (
          <div>
            {Array.isArray(data)
              ? data.map((item, index) =>
                <div className="font-handjet text-lg hover:text-highlight" key={index}>{item}</div>)
              : data}
          </div>
        );
      default:
        return <div className="hover:text-highlight">{data}</div>;
    }
  };

  return (
    <div className="mb-5 mt-5">
      {txExample.expanded.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg ">
            {item.title === 'delegate address' ? 'Delegator Address' : t(`${item.title as 'delegate address'}`)}
          </div>
          <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base">
            {formatData(item.title, item.data)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpandedTxInformation;
