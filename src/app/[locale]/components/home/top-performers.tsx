import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import icons from '@/components/icons';
import topPerformersService, { HighlightRow } from '@/services/top-performers-service';

const rowClassName =
  'flex h-20 shrink-0 items-center gap-5 border-t border-bgSt px-6 hover:bg-bgHover last:border-b last:border-bgSt sm:h-14 sm:gap-4 sm:px-4 md:h-10 md:gap-5 md:px-3.5';

const RowContent = ({ row }: { row: HighlightRow }) => (
  <>
    <Image
      src={row.logoUrl || icons.AvatarIcon}
      alt={row.name}
      width={40}
      height={40}
      className="h-10 w-10 shrink-0 rounded-full border border-white/40 object-contain sm:h-7 sm:w-7 md:h-5 md:w-5"
    />
    <span className="min-w-0 flex-1 truncate font-sfpro text-5xl font-light tracking-normal text-white/90 sm:text-2xl md:text-base">
      {row.name}
    </span>
    <span className="shrink-0 font-handjet text-5xl tracking-normal text-highlight sm:text-2xl md:text-base">
      {row.value}
    </span>
  </>
);

const TopPerformers = async () => {
  const t = await getTranslations('HomePage');
  const { titleKey, rows } = await topPerformersService.getDailyHighlights();

  return (
    <section className="flex min-h-80 min-w-0 flex-col overflow-hidden border border-bgSt bg-table_row shadow-button md:h-[28rem] md:min-h-[28rem]">
      <div className="shrink-0 px-6 pb-5 pt-4 sm:px-4 sm:pb-3 sm:pt-2 md:px-4 md:pb-3 md:pt-2">
        <div className="inline-flex border-b border-bgSt pb-1 pr-5">
          <h2 className="font-handjet text-5xl font-medium tracking-normal text-highlight sm:text-3xl md:text-xl">
            {t('topPerformers')}
          </h2>
        </div>
        <p className="mt-2 font-sfpro text-2xl text-white/60 sm:text-lg md:text-sm">{t(`highlights.${titleKey}`)}</p>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {rows.map((row, index) =>
          row.href ? (
            <Link key={`${row.name}-${index}`} href={row.href} className={rowClassName}>
              <RowContent row={row} />
            </Link>
          ) : (
            <div key={`${row.name}-${index}`} className={rowClassName}>
              <RowContent row={row} />
            </div>
          ),
        )}
      </div>
    </section>
  );
};

export default TopPerformers;
