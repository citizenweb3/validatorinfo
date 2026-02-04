import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import aztecContractService from '@/services/aztec-contracts-service';
import aztecDbService, { NodeDistribution } from '@/services/aztec-db-service';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import nodeService from '@/services/node-service';

import PowerBarChart from './validatorVotingPercentage';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

const fontColors = {
  active: '#4FB848',
  jailed: '#AD1818',
  inactive: '#E5C46B',
  inQueue: '#E5C46B',
  zombie: '#F3B101',
  exiting: '#AD1818',
};

interface DistributionRowProps {
  label: string;
  value: number | null;
  color: string;
  href?: string;
}

const DistributionRow: FC<DistributionRowProps> = ({ label, value, color, href }) => (
  <div className="mt-2 flex w-full flex-wrap border-b border-bgSt">
    <div className="w-1/2 items-center border-r border-bgSt py-5 pl-9 font-sfpro text-lg">{label}</div>
    <div style={{ color }} className="flex w-1/2 items-center justify-between py-5 pl-7 font-handjet text-lg">
      {href ? (
        <Link href={href} className="hover:underline">
          {value ?? 'N/A'}
        </Link>
      ) : (
        value ?? 'N/A'
      )}
    </div>
  </div>
);

const OperatorDistribution: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkStatistics');

  const nodes = chain?.id ? await nodeService.getNodesByChainId(chain.id) : null;
  const isAztec = chain?.name === 'aztec' || chain?.name === 'aztec-testnet';

  let activeNodesLength: number | null = null;
  let inactiveNodesLength: number | null = null;
  let nodeDistribution: NodeDistribution | null = null;

  if (isAztec && chain?.name) {
    try {
      nodeDistribution = await aztecDbService.getNodeDistribution(chain.name);
      activeNodesLength = nodeDistribution?.active ?? null;
    } catch (error) {
      console.error('Failed to fetch node distribution:', error);
      // Fallback to old method
      try {
        activeNodesLength = await aztecContractService.getActiveAttesterCount(chain.name);
      } catch (e) {
        console.error('Failed to fetch active attester count:', e);
      }
    }
    if (!nodeDistribution) {
      const allStakedNodes = nodes?.filter((node) => node.delegatorShares && node.delegatorShares !== '0');
      inactiveNodesLength = allStakedNodes && activeNodesLength ? allStakedNodes.length - activeNodesLength : null;
    }
  } else {
    const activeNodes = nodes?.filter((node) => node.jailed === false);
    activeNodesLength = activeNodes ? activeNodes.length : null;
    inactiveNodesLength = nodes && activeNodesLength ? nodes.length - activeNodesLength : null;
  }

  const data = generateData();

  return (
    <div className="mt-12">
      <SubTitle text={t('Operator Distributions')} />
      <div className="mt-12 flex flex-row">
        <div className={isAztec && nodeDistribution ? 'w-1/4' : 'w-1/5'}>
          {isAztec && nodeDistribution ? (
            <>
              <DistributionRow
                label={t('active')}
                value={nodeDistribution.active}
                color={fontColors.active}
                href={`/networks/${chain?.name}/nodes`}
              />
              <DistributionRow
                label={t('in queue')}
                value={nodeDistribution.inQueue}
                color={fontColors.inQueue}
                href={`/networks/${chain?.name}/nodes`}
              />
              <DistributionRow
                label={t('zombie')}
                value={nodeDistribution.zombie}
                color={fontColors.zombie}
                href={`/networks/${chain?.name}/nodes`}
              />
              <DistributionRow
                label={t('exiting')}
                value={nodeDistribution.exiting}
                color={fontColors.exiting}
                href={`/networks/${chain?.name}/nodes`}
              />
            </>
          ) : (
            <>
              <DistributionRow label={t('active')} value={activeNodesLength} color={fontColors.active} />
              <DistributionRow
                label={isAztec ? t('active in queue') : t('jailed')}
                value={inactiveNodesLength}
                color={isAztec ? fontColors.inactive : fontColors.jailed}
              />
            </>
          )}
        </div>
        <div className={isAztec && nodeDistribution ? 'w-3/4' : 'w-4/5'}>
          <Image
            src={'/img/charts/operator-distribution-coef.svg'}
            width={960}
            height={190}
            alt="coefficients"
            className="ml-24 mt-1.5"
          />
        </div>
      </div>
      <div className="ml-16 mt-20 flex">
        <PowerBarChart data={data} />
      </div>
    </div>
  );
};

export default OperatorDistribution;

const generateData = () => {
  const names = Array.from({ length: 50 }, (_, i) => `Validator ${i + 1}`);
  const randomPercents = Array(50)
    .fill(0)
    .map(() => Math.random());
  const total = randomPercents.reduce((sum, val) => sum + val, 0);
  const normalized = randomPercents.map((val) => (val / total) * 100);

  return names.map((name, i) => ({
    name,
    percent: normalized[i],
  }));
};
