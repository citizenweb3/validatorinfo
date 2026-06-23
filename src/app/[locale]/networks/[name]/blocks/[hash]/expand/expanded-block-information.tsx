import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import BaseTable from '@/components/common/table/base-table';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { ChainWithParams } from '@/services/chain-service';
import { aztecIndexer } from '@/services/aztec-indexer-api';
import atomoneIndexer from '@/services/atomone-indexer-api';
import cosmosIndexer from '@/services/cosmos-indexer-api';
import logosIndexer from '@/services/logos-indexer-api';
import midenIndexer from '@/services/miden-indexer-api';
import Link from 'next/link';
import { getMoneroBlockDetail } from '@/server/tools/chains/monero/indexer-client';
import cutHash from '@/utils/cut-hash';
import { formatXmrReward } from '@/utils/monero';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const formatBytes = (bytes: number): string => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Header cell matching the site's TableSortItems look (no sort).
const HeaderCell: FC<{ label: string }> = ({ label }) => (
  <TableHeaderItem page={'TotalTxsPage'}>
    <div className="group flex flex-row items-center justify-center py-3">
      <div className="w-fit text-wrap text-6xl sm:text-4xl md:text-sm">
        <div className="text-nowrap font-normal">&nbsp;{label}</div>
      </div>
    </div>
  </TableHeaderItem>
);

const ExpandedBlockInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('BlockInformationPage');
  const isLogos = chain?.name === 'logos-testnet';
  const isCosmoshub = chain?.name === 'cosmoshub';
  const isMiden = chain?.name === 'miden-testnet';
  const isAtomone = chain?.name === 'atomone';

  if (chain?.consensusType === 'pow') {
    const block = await getMoneroBlockDetail(hash).catch(() => null);
    if (!block) {
      notFound();
    }

    const expandedData: Array<{ title: string; data: string | number; type: 'hash' | 'number' | 'text' }> = [
      {
        title: 'cumulative difficulty',
        data: block.cumulativeDifficulty != null ? block.cumulativeDifficulty.toLocaleString('en-US') : '-',
        type: 'text',
      },
      { title: 'long term weight', data: block.longTermWeight, type: 'number' },
      { title: 'coinbase extra', data: block.coinbaseExtraHex ?? '-', type: 'hash' },
      { title: 'is canonical', data: block.isCanonical ? t('yes') : t('no'), type: 'text' },
      { title: 'is settled', data: block.isSettled ? t('yes') : t('no'), type: 'text' },
      { title: 'orphan status', data: block.orphanStatus ? t('yes') : t('no'), type: 'text' },
      { title: 'indexed at', data: block.indexedAt, type: 'text' },
    ];

    const formatMonero = (data: string | number, type: 'hash' | 'number' | 'text') => {
      if (type === 'hash') {
        return (
          <div className="flex flex-row items-center gap-2">
            <span className="break-all font-handjet text-lg hover:text-highlight">{data}</span>
            <CopyButton value={data.toString()} size="md" />
          </div>
        );
      }
      if (type === 'number') {
        return (
          <div className="font-handjet text-lg hover:text-highlight">
            {typeof data === 'number' ? data.toLocaleString('en-US') : data}
          </div>
        );
      }
      return <div className="font-handjet text-lg hover:text-highlight">{data}</div>;
    };

    return (
      <div className="mb-5 mt-5">
        {expandedData.map((item) => (
          <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
            <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
              {t(item.title as 'block hash')}
            </div>
            <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base">
              {formatMonero(item.data, item.type)}
            </div>
          </div>
        ))}

        <div className="mt-8">
          <div className="mb-2 ml-5 font-handjet text-xl text-highlight">
            {t('block transactions')} ({block.transactions.length})
          </div>
          <p className="mb-4 ml-5 font-sfpro text-sm opacity-70">{t('amounts hidden')}</p>
          {block.transactions.length === 0 ? (
            <div className="ml-5 font-sfpro text-base opacity-70">{t('no txs in block')}</div>
          ) : (
            <BaseTable>
              <thead>
                <tr className="bg-table_header">
                  <HeaderCell label={t('tx hash')} />
                  <HeaderCell label={t('type')} />
                  <HeaderCell label={t('fee')} />
                  <HeaderCell label={t('size')} />
                  <HeaderCell label={t('in out')} />
                </tr>
              </thead>
              <tbody>
                {block.transactions.map((tx) => (
                  <BaseTableRow key={tx.hash}>
                    <BaseTableCell className="w-1/5 px-2 py-2 hover:text-highlight">
                      <Link href={`/networks/${chain?.name}/tx/${tx.hash}`} className="flex justify-center">
                        <span className="text-center font-handjet text-lg underline underline-offset-3">
                          {cutHash({ value: tx.hash, cutLength: 12 })}
                        </span>
                      </Link>
                    </BaseTableCell>
                    <BaseTableCell className="w-1/5 px-2 py-2">
                      <div className="text-center font-sfpro text-base">
                        {tx.isCoinbase ? t('coinbase') : t('regular')}
                      </div>
                    </BaseTableCell>
                    <BaseTableCell className="w-1/5 px-2 py-2">
                      <div className="text-center font-handjet text-lg">{formatXmrReward(tx.fee)}</div>
                    </BaseTableCell>
                    <BaseTableCell className="w-1/5 px-2 py-2">
                      <div className="text-center font-sfpro text-sm">{formatBytes(tx.size)}</div>
                    </BaseTableCell>
                    <BaseTableCell className="w-1/5 px-2 py-2">
                      <div className="text-center font-handjet text-lg">
                        {tx.inputsCount} / {tx.outputsCount}
                      </div>
                    </BaseTableCell>
                  </BaseTableRow>
                ))}
              </tbody>
            </BaseTable>
          )}
        </div>
      </div>
    );
  }

  if (isMiden) {
    let block;
    try {
      block = await midenIndexer.getBlock(hash, { revalidate: false });
    } catch (error) {
      console.error('Error fetching Miden block for expanded view:', error);
      notFound();
    }
    if (!block) {
      notFound();
    }

    const expandedData: Array<{ title: string; data: string | number; type: 'hash' | 'number' | 'text' }> = [
      { title: 'chain commitment', data: block.chain_commitment, type: 'hash' },
      { title: 'account root', data: block.account_root, type: 'hash' },
      { title: 'nullifier root', data: block.nullifier_root, type: 'hash' },
      { title: 'note root', data: block.note_root, type: 'hash' },
      { title: 'tx commitment', data: block.tx_commitment, type: 'hash' },
      { title: 'tx kernel commitment', data: block.tx_kernel_commitment, type: 'hash' },
      { title: 'validator key', data: block.validator_key, type: 'hash' },
      { title: 'native asset id', data: block.native_asset_id, type: 'hash' },
      { title: 'verification base fee', data: block.verification_base_fee, type: 'text' },
      { title: 'note count', data: block.note_count, type: 'number' },
      { title: 'nullifier count', data: block.nullifier_count, type: 'number' },
      { title: 'version', data: block.version, type: 'number' },
    ];

    const formatData = (data: string | number, type: 'hash' | 'number' | 'text') => {
      if (type === 'hash') {
        return (
          <div className="flex flex-row items-center gap-2">
            <span className="break-all font-handjet text-lg hover:text-highlight">{data}</span>
            <CopyButton value={data.toString()} size="md" />
          </div>
        );
      }
      if (type === 'number') {
        return (
          <div className="font-handjet text-lg hover:text-highlight">
            {typeof data === 'number' ? data.toLocaleString('en-US') : data}
          </div>
        );
      }
      return <div className="font-handjet text-lg hover:text-highlight">{data}</div>;
    };

    return (
      <div className="mb-5 mt-5">
        {expandedData.map((item) => (
          <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
            <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
              {t(item.title as 'block hash')}
            </div>
            <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base">
              {formatData(item.data, item.type)}
            </div>
          </div>
        ))}
        {block.raw_block_bytes && (
          <details className="mt-4">
            <summary className="cursor-pointer pl-8 font-sfpro text-lg hover:text-highlight">
              raw_block_bytes
            </summary>
            <div className="mt-2 flex w-full hover:bg-bgHover">
              <div className="flex w-full items-start gap-2 border-b border-bgSt py-4 pl-8 pr-4 font-sfpro text-base">
                <span className="break-all font-handjet text-base">{block.raw_block_bytes}</span>
                <CopyButton value={block.raw_block_bytes} size="md" />
              </div>
            </div>
          </details>
        )}
      </div>
    );
  }

  if (isCosmoshub) {
    if (!/^\d+$/.test(hash)) {
      notFound();
    }

    let block;
    try {
      const response = await cosmosIndexer.getBlockByHeight(hash, { revalidate: false });
      block = response?.data;
    } catch (error) {
      console.error('Error fetching Cosmos block for expanded view:', error);
      notFound();
    }
    if (!block) {
      notFound();
    }

    const expandedData: Array<{ title: string; data: string | number; type: 'hash' | 'number' | 'text' }> = [
      { title: 'last commit hash', data: block.last_commit_hash ?? '—', type: 'hash' },
      { title: 'data hash', data: block.data_hash ?? '—', type: 'hash' },
      { title: 'app hash', data: block.app_hash ?? '—', type: 'hash' },
      { title: 'proposer address', data: block.proposer_address, type: 'hash' },
      { title: 'size bytes', data: block.size_bytes ?? '—', type: 'number' },
      { title: 'evidence count', data: block.evidence_count, type: 'number' },
      { title: 'transaction count', data: block.tx_count, type: 'number' },
    ];

    const formatData = (data: string | number, type: 'hash' | 'number' | 'text') => {
      if (type === 'hash') {
        if (typeof data === 'string' && data === '—') {
          return <div className="font-handjet text-lg">{data}</div>;
        }
        return (
          <div className="flex flex-row items-center gap-2">
            <span className="break-all font-handjet text-lg hover:text-highlight">{data}</span>
            <CopyButton value={data.toString()} size="md" />
          </div>
        );
      }
      if (type === 'number') {
        return (
          <div className="font-handjet text-lg hover:text-highlight">
            {typeof data === 'number' ? data.toLocaleString('en-US') : data}
          </div>
        );
      }
      return <div className="hover:text-highlight">{data}</div>;
    };

    return (
      <div className="mb-5 mt-5">
        {expandedData.map((item) => (
          <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
            <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
              {t(item.title as 'block hash')}
            </div>
            <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base">
              {formatData(item.data, item.type)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isAtomone) {
    if (!/^\d+$/.test(hash)) {
      notFound();
    }

    let block;
    try {
      const response = await atomoneIndexer.getBlockByHeight(hash, { revalidate: false });
      block = response?.data;
    } catch (error) {
      console.error('Error fetching AtomOne block for expanded view:', error);
      notFound();
    }
    if (!block) {
      notFound();
    }

    const expandedData: Array<{ title: string; data: string | number; type: 'hash' | 'number' | 'text' }> = [
      { title: 'last commit hash', data: block.last_commit_hash ?? '—', type: 'hash' },
      { title: 'data hash', data: block.data_hash ?? '—', type: 'hash' },
      { title: 'app hash', data: block.app_hash ?? '—', type: 'hash' },
      { title: 'proposer address', data: block.proposer_address, type: 'hash' },
      { title: 'size bytes', data: block.size_bytes ?? '—', type: 'number' },
      { title: 'evidence count', data: block.evidence_count, type: 'number' },
      { title: 'transaction count', data: block.tx_count, type: 'number' },
    ];

    const formatData = (data: string | number, type: 'hash' | 'number' | 'text') => {
      if (type === 'hash') {
        if (typeof data === 'string' && data === '—') {
          return <div className="font-handjet text-lg">{data}</div>;
        }
        return (
          <div className="flex flex-row items-center gap-2">
            <span className="break-all font-handjet text-lg hover:text-highlight">{data}</span>
            <CopyButton value={data.toString()} size="md" />
          </div>
        );
      }
      if (type === 'number') {
        return (
          <div className="font-handjet text-lg hover:text-highlight">
            {typeof data === 'number' ? data.toLocaleString('en-US') : data}
          </div>
        );
      }
      return <div className="hover:text-highlight">{data}</div>;
    };

    return (
      <div className="mb-5 mt-5">
        {expandedData.map((item) => (
          <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
            <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
              {t(item.title as 'block hash')}
            </div>
            <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base">
              {formatData(item.data, item.type)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isLogos) {
    let block;
    try {
      block = await logosIndexer.getBlock(hash, { revalidate: false });
    } catch (error) {
      console.error('Error fetching Logos block for expanded view:', error);
      notFound();
    }
    if (!block) {
      notFound();
    }

    const proof = block.raw?.header.proof_of_leadership;
    const expandedData: Array<{ title: string; data: string | number; type: 'hash' | 'number' | 'text' }> = [
      { title: 'block root', data: block.block_root, type: 'hash' },
      { title: 'parent block', data: block.parent_block, type: 'hash' },
      { title: 'leader key', data: block.leader_key, type: 'hash' },
      { title: 'voucher commitment', data: block.voucher_cm, type: 'hash' },
      { title: 'entropy', data: block.entropy, type: 'hash' },
      ...(proof
        ? [
            { title: 'entropy contribution', data: proof.entropy_contribution, type: 'hash' as const },
            { title: 'proof size', data: proof.proof.length, type: 'number' as const },
          ]
        : []),
      { title: 'transaction count', data: block.tx_count, type: 'number' },
    ];

    const formatData = (data: string | number, type: 'hash' | 'number' | 'text') => {
      if (type === 'hash') {
        return (
          <div className="flex flex-row items-center gap-2">
            <span className="break-all font-handjet text-lg hover:text-highlight">{data}</span>
            <CopyButton value={data.toString()} size="md" />
          </div>
        );
      }
      if (type === 'number') {
        return (
          <div className="font-handjet text-lg hover:text-highlight">
            {typeof data === 'number' ? data.toLocaleString('en-US') : data}
          </div>
        );
      }
      return <div className="hover:text-highlight">{data}</div>;
    };

    return (
      <div className="mb-5 mt-5">
        {expandedData.map((item) => (
          <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
            <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
              {t(item.title as 'block root')}
            </div>
            <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base">
              {formatData(item.data, item.type)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const isHeight = /^\d+$/.test(hash);

  let block;
  try {
    block = isHeight
      ? await aztecIndexer.getBlockByHeight(parseInt(hash, 10), { revalidate: false })
      : await aztecIndexer.getBlockByHash(hash, { revalidate: false });
  } catch (error) {
    console.error('Error fetching block for expanded view:', error);
    notFound();
  }

  if (!block) {
    notFound();
  }

  const expandedData = [
    {
      title: 'fee per da gas',
      data: block.header.globalVariables.gasFees.feePerDaGas,
      type: 'number',
    },
    {
      title: 'fee per l2 gas',
      data: block.header.globalVariables.gasFees.feePerL2Gas,
      type: 'number',
    },
    {
      title: 'archive root',
      data: block.archive.root,
      type: 'hash',
    },
    {
      title: 'archive next leaf index',
      data: block.archive.nextAvailableLeafIndex,
      type: 'number',
    },
    {
      title: 'last archive root',
      data: block.header.lastArchive.root,
      type: 'hash',
    },
    {
      title: 'last archive next leaf index',
      data: block.header.lastArchive.nextAvailableLeafIndex,
      type: 'number',
    },
    {
      title: 'note hash tree root',
      data: block.header.state.partial.noteHashTree.root,
      type: 'hash',
    },
    {
      title: 'note hash tree next index',
      data: block.header.state.partial.noteHashTree.nextAvailableLeafIndex,
      type: 'number',
    },
    {
      title: 'nullifier tree root',
      data: block.header.state.partial.nullifierTree.root,
      type: 'hash',
    },
    {
      title: 'nullifier tree next index',
      data: block.header.state.partial.nullifierTree.nextAvailableLeafIndex,
      type: 'number',
    },
    {
      title: 'public data tree root',
      data: block.header.state.partial.publicDataTree.root,
      type: 'hash',
    },
    {
      title: 'public data tree next index',
      data: block.header.state.partial.publicDataTree.nextAvailableLeafIndex,
      type: 'number',
    },
    {
      title: 'l1 to l2 message tree root',
      data: block.header.state.l1ToL2MessageTree.root,
      type: 'hash',
    },
    {
      title: 'l1 to l2 message tree next index',
      data: block.header.state.l1ToL2MessageTree.nextAvailableLeafIndex,
      type: 'number',
    },
    {
      title: 'sponge blob hash',
      data: block.header.spongeBlobHash ?? '0x',
      type: 'hash',
    },
  ];

  const formatData = (title: string, data: number | string, type: string) => {
    switch (type) {
      case 'hash':
        return (
          <div className="flex flex-row items-center gap-2">
            <span className="font-handjet text-lg break-all hover:text-highlight">{data}</span>
            <CopyButton value={data.toString()} size={'md'} />
          </div>
        );
      case 'number':
        return (
          <div className="font-handjet text-lg hover:text-highlight">
            {typeof data === 'number' ? data.toLocaleString('en-US') : data}
          </div>
        );
      default:
        return <div className="hover:text-highlight">{data}</div>;
    }
  };

  return (
    <div className="mt-5 mb-5">
      {expandedData.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t(item.title as 'fee per da gas')}
          </div>
          <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base">
            {formatData(item.title, item.data, item.type)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpandedBlockInformation;
