"use client";

import { useActiveAccount, useReadContract } from "thirdweb/react";
import { getZamoraContract, isContractConfigured } from "@/lib/contracts";
import { demoProfile } from "@/lib/mock-data";

export function useZamoraBalance() {
  const account = useActiveAccount();
  const contract = getZamoraContract("token");

  const query = useReadContract({
    contract: contract as never,
    method: "function balanceOf(address) view returns (uint256)",
    params: [account?.address ?? "0x0000000000000000000000000000000000000000"],
    queryOptions: { enabled: Boolean(contract && account) },
  });

  if (isContractConfigured("token") && account && query.data !== undefined) {
    const decimals = 18;
    const balance = Number(query.data) / 10 ** decimals;
    return { balance, isLoading: query.isLoading, isLive: true };
  }

  return {
    balance: demoProfile.zamora,
    isLoading: false,
    isLive: false,
  };
}
