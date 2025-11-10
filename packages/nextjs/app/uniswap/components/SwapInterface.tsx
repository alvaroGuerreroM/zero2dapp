"use client";

import { useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { parseEther, formatUnits } from "viem";
import { QUOTER_ABI } from "../lib/quoterAbi";

const BUENA_TOKEN = process.env.NEXT_PUBLIC_BUENA_TOKEN_ADDRESS as `0x${string}`;
const CELO_TOKEN = process.env.NEXT_PUBLIC_CELO_TOKEN_ADDRESS as `0x${string}`;
const QUOTER_ADDRESS = process.env.NEXT_PUBLIC_QUOTER_ADDRESS as `0x${string}`;
const FEE_TIER = Number(process.env.NEXT_PUBLIC_POOL_FEE_TIER) || 3000;
const TICK_SPACING = Number(process.env.NEXT_PUBLIC_POOL_TICK_SPACING) || 60;
const HOOKS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

export function SwapInterface() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<string>("");
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  async function handleGetQuote() {
    if (!amount || Number(amount) <= 0 || !publicClient) return;

    setIsLoadingQuote(true);

    try {
      const amountIn = parseEther(amount);
      const zeroForOne = CELO_TOKEN.toLowerCase() < BUENA_TOKEN.toLowerCase();

      const poolKey = {
        currency0: zeroForOne ? CELO_TOKEN : BUENA_TOKEN,
        currency1: zeroForOne ? BUENA_TOKEN : CELO_TOKEN,
        fee: FEE_TIER,
        tickSpacing: TICK_SPACING,
        hooks: HOOKS,
      };

      const result = await publicClient.readContract({
        address: QUOTER_ADDRESS,
        abi: QUOTER_ABI,
        functionName: "quoteExactInputSingle",
        args: [
          {
            poolKey,
            zeroForOne,
            exactAmount: amountIn,
            hookData: "0x",
          },
        ],
      });

      const [amountOut] = result;
      setQuote(formatUnits(amountOut, 2));
    } catch (error: any) {
      console.error("Error getting quote:", error);

      if (error.message?.includes("NotEnoughLiquidity")) {
        alert("Pool doesn't have enough liquidity for this trade");
      } else {
        alert(`Failed to get quote: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsLoadingQuote(false);
    }
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-2">💱 Swap Tokens</h2>
        <p className="text-sm opacity-70 mb-6">
          Swap CELO for BuenaToken using Uniswap v4
        </p>

        {!isConnected ? (
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
            <span>Please connect your wallet to swap</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-base-300 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium opacity-70">You pay</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0.0"
                  className="input input-ghost text-3xl font-bold w-full p-0 focus:outline-none bg-transparent"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
                <div className="flex items-center gap-2 bg-base-100 px-4 py-2 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                    C
                  </div>
                  <span className="font-bold">CELO</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-2 relative z-10">
              <div className="btn btn-circle btn-sm bg-base-300 border-4 border-base-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-base-300 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium opacity-70">
                  You receive (estimated)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="0.0"
                  className="input input-ghost text-3xl font-bold w-full p-0 focus:outline-none bg-transparent"
                  value={quote}
                  disabled
                />
                <div className="flex items-center gap-2 bg-base-100 px-4 py-2 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
                    B
                  </div>
                  <span className="font-bold">BTK</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-base-300 rounded-xl p-4">
                <div className="text-xs opacity-60 mb-1">Quote from</div>
                <div className="font-bold text-sm">Uniswap Quoter</div>
              </div>
              <div className="bg-base-300 rounded-xl p-4">
                <div className="text-xs opacity-60 mb-1">Minimum Received</div>
                <div className="font-bold">
                  {quote ? (Number(quote) * 0.995).toFixed(2) : "--"} BTK
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                className="btn btn-outline btn-primary btn-lg"
                disabled={!amount || Number(amount) <= 0 || isLoadingQuote}
                onClick={handleGetQuote}
              >
                {isLoadingQuote ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Calculating...
                  </>
                ) : (
                  "📊 Get Quote"
                )}
              </button>
              <button className="btn btn-primary btn-lg" disabled={!quote}>
                🔄 Swap
              </button>
            </div>
          </div>
        )}

        <div className="divider"></div>

        <div className="flex items-start gap-3 p-4 bg-info/10 rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info shrink-0 w-5 h-5 mt-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div className="text-sm">
            <p className="font-bold mb-1">Using Uniswap v4 Quoter</p>
            <p className="opacity-70">
              Quote fetched from Quoter contract using quoteExactInputSingle()
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}