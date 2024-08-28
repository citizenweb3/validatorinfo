import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Link className="border-red-500 my-3 w-1/3 border-4  border-double p-3" href="./charts/doughnut">
        doughnut
      </Link>
      <Link className="border-red-500 my-3 w-1/3 border-4  border-double p-3" href="./charts/line">
        line
      </Link>
    </div>
  );
}
