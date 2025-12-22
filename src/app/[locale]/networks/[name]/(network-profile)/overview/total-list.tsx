import { getTranslations } from 'next-intl/server';
import { FC, Suspense } from 'react';

import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import Tooltip from '@/components/common/tooltip';
import aztecContractService from '@/services/aztec-contracts-service';
import { aztecIndexer } from '@/services/aztec-indexer-api';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import formatCash from '@/utils/format-cash';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

interface AztecMetricsProps {
  chainName: string;
}

const AztecTxCard: FC = async () => {
  const t = await getTranslations('NetworkPassport');
  const totalTxs = await aztecIndexer.getTotalTxEffects();

  console.log(`total txs - ${totalTxs}`);

  return (
    <MetricsCardItem
      title={t('total amount of tx')}
      data={totalTxs ?? 'N/A'}
      className={'pb-6 pt-2.5'}
      dataClassName={'mt-5'}
    />
  );
};

const AztecTxCardLoading: FC = () => {
  return (
    <MetricsCardItem
      title="Total amount of tx"
      data="Loading..."
      className={'animate-pulse pb-6 pt-2.5'}
      dataClassName={'mt-5'}
    />
  );
};

const AztecBlocksSlotsEpochs: FC<AztecMetricsProps> = async ({ chainName }) => {
  const t = await getTranslations('NetworkPassport');
  const totalBlocks = await aztecIndexer.getLatestHeight({ cache: 'no-store' });
  const totalSlots = await aztecContractService.getLatestSlot(chainName);
  const totalEpochs = await aztecContractService.getLatestEpoch(chainName);

  if (!totalSlots && !totalBlocks && !totalEpochs) return null;

  return (
    <div className="mt-6 flex w-full flex-row justify-center gap-6">
      {totalBlocks && (
        <MetricsCardItem
          title={t('total amount of blocks')}
          data={totalBlocks}
          className={'pb-6 pt-2.5'}
          dataClassName={'mt-5'}
        />
      )}
      {totalSlots && (
        <MetricsCardItem
          title={t('total amount of slots')}
          data={totalSlots}
          className={'pb-6 pt-2.5'}
          dataClassName={'mt-5'}
        />
      )}
      {totalEpochs && (
        <MetricsCardItem
          title={t('total amount of epochs')}
          data={totalEpochs}
          className={'pb-6 pt-2.5'}
          dataClassName={'mt-5'}
        />
      )}
    </div>
  );
};

const TotalsListNetworkPassport: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkPassport');
  const totalSupply =
    chain?.tokenomics?.totalSupply && chain?.params?.coinDecimals != null
      ? Number(chain?.tokenomics?.totalSupply) / Number(10 ** chain?.params?.coinDecimals)
      : 0;

  return (
    <>
      <div className="mt-20 flex w-full flex-row justify-center gap-6">
        <MetricsCardItem
          title={t('amount of wallets')}
          data={chain?.walletsAmount?.toLocaleString() ?? 'N/A'}
          className={'pb-6 pt-2.5'}
          dataClassName={'mt-5'}
        />
        {chain?.name === 'aztec' ? (
          <Suspense fallback={<AztecTxCardLoading />}>
            <AztecTxCard />
          </Suspense>
        ) : (
          <MetricsCardItem
            title={t('total amount of tx')}
            data="N/A"
            className={'pb-6 pt-2.5'}
            dataClassName={'mt-5'}
          />
        )}
        <MetricsCardItem
          title={t('total supply')}
          data={
            <Tooltip tooltip={totalSupply.toLocaleString()}>
              {`${formatCash(totalSupply)} ${chain?.params?.denom}`}
            </Tooltip>
          }
          className={'pb-6 pt-2.5'}
          dataClassName={'mt-5'}
        />
      </div>
      {chain?.name === 'aztec' && (
        <Suspense fallback={null}>
          <AztecBlocksSlotsEpochs chainName={chain.name} />
        </Suspense>
      )}
    </>
  );
};

export default TotalsListNetworkPassport;
