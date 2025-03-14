import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { FC } from 'react';
import SubTitle from '@/components/common/sub-title';
import nodeService from '@/services/node-service';

interface OwnProps {
  chainId: number;
}

const OperatorDistribution: FC<OwnProps> = async ({ chainId }) => {
  const t = await getTranslations('NetworkStatistics');
  const fontColors = {
    active: '#4FB848', jailed: '#AD1818', inactive: '#E5C46B',
  };

  const nodes = await nodeService.getNodesByChainId(chainId);
  const activeNodes = nodes?.filter(node => node.jailed === false);
  const jailedNodes = nodes?.filter(node => node.jailed === true);

  return (
    <div className="mt-12">
      <SubTitle text={t('Operator Distributions')} />
      <div className="mt-12 flex flex-row">
        <div className="w-1/5">
          <div className="mt-2 flex w-full flex-wrap border-b border-bgSt">
            <div className="w-1/2 items-center border-r border-bgSt py-5 pl-9 font-sfpro text-lg">
              {t('active')}
            </div>
            <div
              style={{ color: fontColors['active'] }}
              className="flex w-1/2 items-center justify-between py-5 pl-7 font-handjet text-lg"
            >
              {activeNodes?.length ?? '232'}
            </div>
          </div>
          <div className="mt-2 flex w-full flex-wrap border-b border-bgSt">
            <div className="w-1/2 items-center border-r border-bgSt py-5 pl-9 font-sfpro text-lg">
              {t('jailed')}
            </div>
            <div
              style={{ color: fontColors['jailed'] }}
              className="flex w-1/2 items-center justify-between py-5 pl-7 font-handjet text-lg"
            >
              {jailedNodes?.length ?? '423'}
            </div>
          </div>
        </div>
        <div className="w-4/5">
          <Image
            src={'/img/charts/operator-distribution-coef.svg'}
            width={960}
            height={190}
            alt="coefficients"
            className="mt-1.5 ml-24"
          />
        </div>
      </div>
      <div className="flex ml-16 mt-24">
        <Image src={'/img/charts/operator-distribution-vp.svg'}
               width={1325}
               height={275} alt="vp"
               className="" />
      </div>
    </div>
  );
};

export default OperatorDistribution;
