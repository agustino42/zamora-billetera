"use client";

import type { Account } from "thirdweb/wallets";
import { CONTRACTS, RELAYER_ADDRESS } from "@/lib/config";
import { signZamoraPermit, type SignedPermit } from "@/lib/onchain/permit";

/** Extrae el id secuencial on-chain a partir de un id mock (`tsk-3` → 3). */
export function onchainId(id: string): number {
  return Number(id.replace(/\D/g, "")) || 0;
}

export type StudentAuth = {
  address: string;
  message: string;
  signature: `0x${string}`;
};

export type RelayResult =
  | { ok: true; hash: string }
  | { ok: false; error: string };

async function studentAuth(account: Account, action: string): Promise<StudentAuth> {
  const address = account.address as `0x${string}`;
  const timestamp = Date.now();
  const message = `Zamora Wallet\naction: ${action}\naddress: ${address.toLowerCase()}\ntimestamp: ${timestamp}`;
  const signature = await account.signMessage({ message });
  return { address, message, signature: signature as `0x${string}` };
}

async function call(
  action: string,
  payload: Record<string, unknown>,
): Promise<RelayResult> {
  try {
    const res = await fetch("/api/relay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    return (await res.json()) as RelayResult;
  } catch {
    return { ok: false, error: "No se pudo contactar al relayer." };
  }
}

/** Spender que debe autorizarse vía permit para cada acción que gasta ZAMORA. */
const PERMIT_SPENDERS: Record<string, () => `0x${string}`> = {
  transfer: () => RELAYER_ADDRESS,
  "boost-burn": () => RELAYER_ADDRESS,
  "forum-post": () => CONTRACTS.forum,
  "rewards-redeem": () => CONTRACTS.rewards,
  "courses-enroll": () => CONTRACTS.courses,
};

/**
 * Ejecuta una acción on-chain relayerizada por cuenta del estudiante. Firma la
 * autenticación y, si la acción gasta ZAMORA, un permiso EIP-2612 (sin gas).
 */
export async function studentRelay(params: {
  account: Account;
  action: string;
  amount?: number;
  payload?: Record<string, unknown>;
}): Promise<RelayResult> {
  const { account, action, amount, payload = {} } = params;
  const auth = await studentAuth(account, action);

  let permit: SignedPermit | undefined;
  const spender = PERMIT_SPENDERS[action];
  if (spender) {
    if (typeof amount !== "number") {
      throw new Error("Falta el importe para autorizar el gasto.");
    }
    permit = await signZamoraPermit({
      account,
      spender: spender(),
      amount,
    });
  }

  return call(action, { auth, permit, ...payload });
}

/** Acción firmada por profesor/admin (sin permiso; el relayer ejecuta). */
export async function staffRelay(
  action: string,
  payload: Record<string, unknown> = {},
  role: "professor" | "admin" = "admin",
): Promise<RelayResult> {
  const res = await fetch("/api/relay", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-zamora-role": role,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  return (await res.json()) as RelayResult;
}

export { studentAuth };
