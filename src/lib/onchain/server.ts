import {
  createThirdwebClient,
  getContract,
  readContract,
  prepareContractCall,
  sendTransaction,
  type ThirdwebContract,
} from "thirdweb";
import { privateKeyToAccount, type Account } from "thirdweb/wallets";
import { chain, CONTRACTS } from "@/lib/config";
import {
  tokenAbi,
  campusAbi,
  rewardsAbi,
  collectiblesAbi,
  coursesAbi,
  forumAbi,
} from "@/lib/contracts";

type ContractKind = keyof typeof CONTRACTS;

const ABIS = {
  token: tokenAbi,
  campus: campusAbi,
  rewards: rewardsAbi,
  collectibles: collectiblesAbi,
  courses: coursesAbi,
  forum: forumAbi,
};

const secretKey = process.env.THIRDWEB_SECRET_KEY;
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

/** Cliente de servidor: prefiere la secret key para evitar límites del cliente. */
export const serverClient = createThirdwebClient(
  secretKey ? { secretKey } : { clientId: clientId ?? "" },
);

let cachedAccount: Account | null = null;

/** Cuenta del relayer (system wallet). Paga TODO el gas. */
export function getSystemAccount(): Account {
  if (cachedAccount) return cachedAccount;
  const privateKey = process.env.SYSTEM_WALLET_PRIVATE_KEY;
  if (!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
    throw new Error("SYSTEM_WALLET_PRIVATE_KEY no está configurada.");
  }
  cachedAccount = privateKeyToAccount({
    client: serverClient,
    privateKey: privateKey as `0x${string}`,
  });
  return cachedAccount;
}

export function getSystemAddress(): `0x${string}` {
  return getSystemAccount().address as `0x${string}`;
}

export function isRelayerConfigured() {
  const pk = process.env.SYSTEM_WALLET_PRIVATE_KEY;
  return Boolean(pk && /^0x[0-9a-fA-F]{64}$/.test(pk)) && Boolean(CONTRACTS.token);
}

function getServerContract(kind: ContractKind): ThirdwebContract | null {
  const address = CONTRACTS[kind];
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return null;
  return getContract({
    client: serverClient,
    chain,
    address,
    abi: ABIS[kind],
  }) as ThirdwebContract;
}

type LooseRead = (args: {
  contract: unknown;
  method: string;
  params: unknown[];
}) => Promise<unknown>;

type LoosePrepare = (args: {
  contract: unknown;
  method: string;
  params: unknown[];
}) => unknown;

const looseRead = readContract as unknown as LooseRead;
const loosePrepare = prepareContractCall as unknown as LoosePrepare;
const looseSend = sendTransaction as unknown as (args: {
  transaction: unknown;
  account: Account;
}) => Promise<{ transactionHash: `0x${string}` }>;

export async function readServer<T = unknown>(
  kind: ContractKind,
  method: string,
  params: unknown[] = [],
): Promise<T> {
  const contract = getServerContract(kind);
  if (!contract) throw new Error(`El contrato ${kind} no está configurado.`);
  return (await looseRead({ contract, method, params })) as T;
}

/** Prepara y envía una llamada firmada por la system wallet. Devuelve el tx hash. */
export async function relayCall(
  kind: ContractKind,
  method: string,
  params: unknown[] = [],
): Promise<`0x${string}`> {
  const contract = getServerContract(kind);
  if (!contract) throw new Error(`El contrato ${kind} no está configurado.`);
  const account = getSystemAccount();
  const transaction = loosePrepare({ contract, method, params });
  const receipt = await looseSend({ transaction, account });
  return receipt.transactionHash;
}

export type PermitPayload = {
  owner: `0x${string}`;
  spender: `0x${string}`;
  value: string;
  deadline: string;
  v: number;
  r: `0x${string}`;
  s: `0x${string}`;
};

/** Envía la firma EIP-2612 del estudiante (el relayer paga el gas). */
export async function submitPermit(permit: PermitPayload): Promise<`0x${string}`> {
  return relayCall(
    "token",
    "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
    [
      permit.owner,
      permit.spender,
      BigInt(permit.value),
      BigInt(permit.deadline),
      permit.v,
      permit.r,
      permit.s,
    ],
  );
}
