import PageTitle from '@/components/common/page-title';

export default function Home() {
  return (
    <div className="flex flex-col">
      <PageTitle text="Staking Calculator" />
      <div className="mt-6 pl-4 pr-20 text-base">
        What is Lorem Ipsum?
        <br />
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry
        standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make
        a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,
        remaining essentially unchanged.
      </div>
    </div>
  );
}
