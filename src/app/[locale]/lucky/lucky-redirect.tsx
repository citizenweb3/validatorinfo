'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LuckyRedirect({ validatorsCount }: { validatorsCount: number }) {
  const router = useRouter();

  useEffect(() => {
    const random = Math.floor(Math.random() * validatorsCount) + 1;
    router.replace(`/validators/${random}/networks`);
  }, [validatorsCount]);

  return null;
}
