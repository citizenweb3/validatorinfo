import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <Link href="./charts/doughnut">doughnut</Link>
      <Link href="./charts/line">line</Link>
    </div>
  );
}
