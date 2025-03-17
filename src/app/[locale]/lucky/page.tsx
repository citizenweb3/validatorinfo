import LuckyRedirect from '@/app/lucky/lucky-redirect';
import db from '@/db';

export default async function Lucky() {
  const validatorsCount = (await db.validator.count()) || 300; // Запрос к БД
  return <LuckyRedirect validatorsCount={validatorsCount} />;
}
