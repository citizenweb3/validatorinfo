import { fromBase64, fromBech32 } from "@cosmjs/encoding";
import { verifyADR36Amino } from "@keplr-wallet/cosmos";
import { StdSignature } from "@keplr-wallet/types";
import db from '@/db';
import type { NextApiResponse } from "next";
import crypto from "crypto";
import base64url from "base64url";

export interface WalletProof {
  chainId: string;
  address: string;
  signature: StdSignature;
  key: string;
  extension: "keplr" | "leap" | "cosmostation";
  walletName: string;
}

export  async function POST(
  req: Request,
) {
  if (req.method !== "POST")
    return new Response("Only POST requests are supported", {status: 401});

  const { address, chainId, signature, key, extension, walletName } =
    JSON.parse(await req.json()) as WalletProof;

  const supportedWallets = ["keplr", "cosmostation", "leap"];

  if (!supportedWallets.find((wallet) => extension === wallet))
    return new Response("Extension not valid", {status: 401});

  if (chainId !== "cosmoshub-4") new Response("Chain-id not valid", {status: 401});

  try {
    fromBech32(address);
  } catch (e) {
    return new Response("Address not valid", {status: 401});
  }

  const verification = verifyADR36Amino(
    fromBech32(address).prefix,
    address,
    key,
    fromBase64(signature.pub_key.value),
    fromBase64(signature.signature),
    "secp256k1",
  );

  if (!verification)  new Response("Signature not valid", {status: 401});

  const account = await db.account.findUnique({
    where: {mainAddress: address },
  });
  if (!account) {
    await db.account.create({
      data: {
        mainAddress: address,
        addresses: {
          create: {
            address: address,
            chain: { connect: { chainId: "cosmoshub-4" } },
          },
        },
      },
    });
  }

  const header = base64url.encode(
    JSON.stringify({
      alg: "HS256",
      typ: "JWT",
    }),
  );

  const payload = base64url.encode(
    JSON.stringify({
      address: address,
      extension: extension,
      chainId: "cosmoshub-4",
      walletName: walletName,
    }),
  );

  const hmac = crypto.createHmac("sha256", `${process.env.NEXTAUTH_SECRET}`);
  const jwtSignature = hmac.update(header + "." + payload).digest("base64url");

  return new Response(
    JSON.stringify({
      message: "JWT token generated successfully",
      jwt: header + "." + payload + "." + jwtSignature,
    }),
    {status: 200},
  );
}