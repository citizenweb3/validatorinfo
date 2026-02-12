import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { txExample } from '@/app/networks/[name]/tx/txExample';
import CopyButton from '@/components/common/copy-button';
import { isAztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { AztecTxEffect } from '@/services/aztec-indexer-api/types';
import TxService from '@/services/tx-service';
import { ChainWithParams } from '@/services/chain-service';
import Link from 'next/link';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const ExpandedTxInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('TxInformationPage');

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
