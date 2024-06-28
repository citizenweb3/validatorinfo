import Image from 'next/image';

export default function Partners() {
  return (
    <div className="flex items-center justify-center">
      <Image
        src={'/img/charts/about-partners.svg'}
        alt="mock"
        width={466}
        height={386}
        className="h-[29.125rem] w-[24.125rem]"
      />
    </div>
  );
}
