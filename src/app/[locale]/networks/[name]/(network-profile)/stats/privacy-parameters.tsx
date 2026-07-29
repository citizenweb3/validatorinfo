import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import SubTitle from '@/components/common/sub-title';

interface PrivacyParameter {
  description: string;
  name: string;
  sourceUrl: string;
  value: string;
}

const PrivacyParameters = async () => {
  const t = await getTranslations('PowNetworkStats');
  const required = t('privacyRequired');
  const parameters: PrivacyParameter[] = [
    {
      name: t('ringSize'),
      value: t('ringSizeValue'),
      description: t('ringSizeDescription'),
      sourceUrl: 'https://www.getmonero.org/resources/moneropedia/ring-size.html',
    },
    {
      name: 'RingCT',
      value: required,
      description: t('ringCtDescription'),
      sourceUrl: 'https://www.getmonero.org/resources/moneropedia/ringCT.html',
    },
    {
      name: 'CLSAG',
      value: required,
      description: t('clsagDescription'),
      sourceUrl: 'https://www.getmonero.org/resources/moneropedia/clsag.html',
    },
    {
      name: 'Bulletproofs+',
      value: required,
      description: t('bulletproofsPlusDescription'),
      sourceUrl: 'https://github.com/monero-project/monero#scheduled-softwarenetwork-upgrades',
    },
  ];

  return (
    <section aria-label={t('privacyParameters')}>
      <SubTitle text={t('privacyParameters')} />
      <p className="mt-4 font-sfpro text-sm opacity-75">{t('privacyParametersDisclaimer')}</p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {parameters.map((parameter) => (
          <article key={parameter.name} className="border-r border-t border-bgSt bg-table_row p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-sfpro text-base">{parameter.name}</h3>
              <span className="font-handjet text-lg text-highlight">{parameter.value}</span>
            </div>
            <p className="mt-3 font-sfpro text-sm opacity-80">{parameter.description}</p>
            <Link
              href={parameter.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-3 mt-3 inline-block font-sfpro text-sm underline hover:text-highlight"
            >
              {t('officialMoneroSource')}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PrivacyParameters;
