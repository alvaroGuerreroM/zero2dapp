"use client";

import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import buenaTokenAbi from "../../../../../artifacts/BuenaToken.json";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_BUENA_TOKEN_ADDRESS as `0x${string}`;

export function TokenBalance() {
  const { address, isConnected } = useAccount();

  const balanceOfResult = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: buenaTokenAbi.abi as any,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const { data: balance, isLoading } = balanceOfResult;

  const { data: tokenName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: buenaTokenAbi.abi as any,
    functionName: "name",
  });

  const { data: tokenSymbol } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: buenaTokenAbi.abi as any,
    functionName: "symbol",
  });

  const { data: decimals } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: buenaTokenAbi.abi as any,
    functionName: "decimals",
  });

  if (!isConnected) {
    return (
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body space-y-4">
          <h2 className="card-title text-2xl mb-4">💰 Token Balance</h2>
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Please connect your wallet to view your token balance</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl border border-base-300">
      <div className="card-body space-y-4">
        <h2 className="card-title text-2xl mb-4">💰 Token Balance</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="stat bg-base-300 rounded-lg p-6">
              <div className="stat-title">
                {(tokenName as string) || "BuenaToken"}
              </div>
              <div className="stat-value text-primary text-4xl">
                {balance
                  ? parseFloat(
                      formatUnits(balance as bigint, decimals as number),
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })
                  : "0.00"}
              </div>
              <div className="stat-desc">
                {(tokenSymbol as string) || "BTK"}
              </div>
            </div>
            <div className="text-sm opacity-70 font-mono break-all">
              Your Address: {address}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
