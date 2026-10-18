"use client";

import { readContract } from "thirdweb";
import type { Account } from "thirdweb/wallets";
import { getZamoraContract } from "@/lib/contracts";
import { APP, CONTRACTS } from "@/lib/config";
import { toZamoraUnits } from "@/lib/onchain/units";

export type SignedPermit = {
  owner: `0x${string}`;
  spender: `0x${string}`;
  value: string;
  deadline: string;
  v: number;
  r: `0x${string}`;
  s: `0x${string}`;
};

function splitSignature(signature: `0x${string}`) {
  const r = `0x${signature.slice(2, 66)}` as `0x${string}`;
  const s = `0x${signature.slice(66, 130)}` as `0x${string}`;
  let v = parseInt(signature.slice(130, 132), 16);
  if (Number.isNaN(v)) {
    throw new Error("Firma inválida");
  }
  if (v < 27) v += 27;
  return { r, s, v };
}

/**
 * Firma un permiso EIP-2612 (sin gas) autorizando a `spender` a gastar `amount`
 * ZAMORA de la cuenta activa. El backend lo envía junto a la acción on-chain.
 */
export async function signZamoraPermit(params: {
  account: Account;
  spender: `0x${string}`;
  amount: number;
  deadlineSeconds?: number;
}): Promise<SignedPermit> {
  const { account, spender, amount, deadlineSeconds = 3600 } = params;

  const contract = getZamoraContract("token");
  if (!contract) {
    throw new Error("El token ZAMORA no está configurado.");
  }

  const nonce = (await readContract({
    contract: contract as never,
    method: "function nonces(address owner) view returns (uint256)",
    params: [account.address],
  })) as bigint;

  const value = toZamoraUnits(amount);
  const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineSeconds);

  const signature = await account.signTypedData({
    domain: {
      name: APP.tokenName,
      version: "1",
      chainId: APP.chainId,
      verifyingContract: CONTRACTS.token,
    },
    types: {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Permit",
    message: {
      owner: account.address,
      spender,
      value,
      nonce,
      deadline,
    },
  });

  const { r, s, v } = splitSignature(signature as `0x${string}`);

  return {
    owner: account.address as `0x${string}`,
    spender,
    value: value.toString(),
    deadline: deadline.toString(),
    v,
    r,
    s,
  };
}
