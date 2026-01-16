import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const CoCreateButton = async () => {
  const t = await getTranslations('Header');

  return (
    <Link
      href="/about"
      aria-label={t('Co-Create & Support')}
      className="group flex items-center justify-center border border-dashed border-dottedLine bg-gradient-to-t from-[#181818] from-[26%] to-[rgba(62,62,62,0.3)] px-2.5 py-0.5 shadow-[0px_6px_6px_0px_black,0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:border-solid hover:bg-bgHover active:scale-95 active:border-solid active:border-bgSt active:bg-background active:from-transparent active:to-transparent active:shadow-none"
    >
      <span className="text-dottedLine text-base text-gold-glow group-active:[text-shadow:none]">
        {t('Co-Create & Support')}
      </span>
    </Link>
  );
};

export default CoCreateButton;
