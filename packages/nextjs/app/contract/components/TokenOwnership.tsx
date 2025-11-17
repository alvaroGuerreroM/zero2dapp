"use client";

import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import buenaTokenAbi from "../../../../../artifacts/BuenoToken.json";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_BUENA_TOKEN_ADDRESS as `0x${string}`;
const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || "";
const SUBGRAPH_API_KEY = process.env.NEXT_PUBLIC_GRAPH_API_KEY;

const query = gql`
  {
    transfers(first: 1000, orderBy: blockTimestamp, orderDirection: desc) {
      id
      from
      to
      value
      blockTimestamp
      blockNumber
      transactionHash
    }
  }
`;

interface Transfer {
  from: string;
  to: string;
  value: string;
  blockTimestamp: string;
  blockNumber: string;
  transactionHash: string;
}

interface AddressBalance {
  address: string;
  totalReceived: bigint;
  totalSent: bigint;
  netBalance: bigint;
  transferCount: number;
}

export function TokenOwnership() {
  const headers: Record<string, string> = SUBGRAPH_API_KEY
    ? { Authorization: `Bearer ${SUBGRAPH_API_KEY}` }
    : {};

  const { data, isLoading, error } = useQuery({
    queryKey: ["token-ownership"],
    queryFn: async () => {
      if (!SUBGRAPH_URL) {
        throw new Error("Subgraph URL not configured");
      }
      return await request<{ transfers: Transfer[] }>(
        SUBGRAPH_URL,
        query,
        {},
        headers
      );
    },
    enabled: !!SUBGRAPH_URL,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Aggregate balances from transfers
  const balances = new Map<string, AddressBalance>();

  if (data?.transfers) {
    data.transfers.forEach((transfer) => {
      const value = BigInt(transfer.value);

      // Handle recipient
      if (transfer.to) {
        const toLower = transfer.to.toLowerCase();
        if (!balances.has(toLower)) {
          balances.set(toLower, {
            address: transfer.to,
            totalReceived: BigInt(0),
            totalSent: BigInt(0),
            netBalance: BigInt(0),
            transferCount: 0,
          });
        }
        const toBalance = balances.get(toLower)!;
        toBalance.totalReceived += value;
        toBalance.netBalance = toBalance.totalReceived - toBalance.totalSent;
        toBalance.transferCount += 1;
      }

      // Handle sender (skip zero address for mints)
      if (
        transfer.from &&
        transfer.from !== "0x0000000000000000000000000000000000000000"
      ) {
        const fromLower = transfer.from.toLowerCase();
        if (!balances.has(fromLower)) {
          balances.set(fromLower, {
            address: transfer.from,
            totalReceived: BigInt(0),
            totalSent: BigInt(0),
            netBalance: BigInt(0),
            transferCount: 0,
          });
        }
        const fromBalance = balances.get(fromLower)!;
        fromBalance.totalSent += value;
        fromBalance.netBalance =
          fromBalance.totalReceived - fromBalance.totalSent;
        fromBalance.transferCount += 1;
      }
    });
  }

  const balancesArray = Array.from(balances.values())
    .filter((b) => b.netBalance > BigInt(0)) // Only show addresses with positive balance
    .sort((a, b) => {
      if (b.netBalance > a.netBalance) return 1;
      if (b.netBalance < a.netBalance) return -1;
      return 0;
    });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!SUBGRAPH_URL) {
    return (
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">👥 Token Ownership</h2>
          <div className="alert alert-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              Subgraph URL not configured. Please set NEXT_PUBLIC_SUBGRAPH_URL
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">👥 Token Ownership</h2>
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">👥 Token Ownership</h2>
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Error loading ownership data: {(error as Error).message}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">👥 Token Ownership</h2>
        <p className="text-sm opacity-70 mb-4">
          Showing addresses with token balances based on transfer history
        </p>
        {balancesArray.length === 0 ? (
          <div className="text-center py-8 opacity-60">
            <p>No token holders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Address</th>
                  <th>Net Balance</th>
                  <th>Total Received</th>
                  <th>Total Sent</th>
                  <th>Transfers</th>
                </tr>
              </thead>
              <tbody>
                {balancesArray.map((balance, index) => (
                  <TokenBalanceRow
                    key={balance.address}
                    rank={index + 1}
                    balance={balance}
                    formatAddress={formatAddress}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TokenBalanceRow({
  rank,
  balance,
  formatAddress,
}: {
  rank: number;
  balance: AddressBalance;
  formatAddress: (addr: string) => string;
}) {
  const { data: currentBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: buenaTokenAbi.abi as any,
    functionName: "balanceOf",
    args: [balance.address as `0x${string}`],
  });

  const displayBalance = currentBalance
    ? formatEther(currentBalance as bigint)
    : formatEther(balance.netBalance);

  return (
    <tr>
      <td className="font-bold">#{rank}</td>
      <td className="font-mono text-sm">
        <a
          href={`https://celo-sepolia.blockscout.com/address/${balance.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="link link-primary"
        >
          {formatAddress(balance.address)}
        </a>
      </td>
      <td className="font-semibold">
        {parseFloat(displayBalance).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })}
      </td>
      <td className="text-sm opacity-70">
        {parseFloat(formatEther(balance.totalReceived)).toLocaleString(
          undefined,
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          }
        )}
      </td>
      <td className="text-sm opacity-70">
        {parseFloat(formatEther(balance.totalSent)).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })}
      </td>
      <td>{balance.transferCount}</td>
    </tr>
  );
}
