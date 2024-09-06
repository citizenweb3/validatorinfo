import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';


const client = new PrismaClient();

export async function GET(req: Request, ctx: any) {
  const validators = await client.$queryRaw`
  WITH LatestPrice AS (
    SELECT 
      p."chainId",
      p.value AS latest_price,
      ROW_NUMBER() OVER (PARTITION BY p."chainId" ORDER BY p."date" DESC) AS rn
    FROM 
      "Price" p
  )
  SELECT 
    v.moniker,
    v.identity,
    ARRAY_AGG(DISTINCT v."chainId"::TEXT) AS chainIds,
    ARRAY_AGG(DISTINCT c."name") AS chainNames,
    ARRAY_AGG(DISTINCT c."prettyName") AS chainPrettyNames,
    ARRAY_AGG(DISTINCT c."logoUrl") AS chainLogoUrls,
    ARRAY_AGG(DISTINCT c."type") AS chainTypes,
    vl."url" AS logoUrl,
    ARRAY_AGG(
      COALESCE(latest_price.latest_price, 0) * (v.tokens::FLOAT / (10 ^ c."coinDecimals"))
    ) AS tvs
  FROM 
    "Validator" v
  LEFT JOIN 
    "Chain" c ON v."chainId" = c."chainId"
  LEFT JOIN 
    "ValidatorLogo" vl ON v."identity" = vl."identity"
  LEFT JOIN 
    LatestPrice latest_price ON v."chainId" = latest_price."chainId" AND latest_price.rn = 1
  GROUP BY 
    v.moniker, v.identity, vl."url";
`;
  return NextResponse.json(validators);
}