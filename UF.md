# Uniswap Foundation Integration Guide

## 📋 Overview

In this workshop we will integrate Uniswap v4 to:
1. **Query pool information** - See liquidity and price of BuenaToken
2. **Execute swaps** - Trade BuenaToken on Uniswap v4

We keep it simple and focused on the core functionality of Uniswap.

**Time:** 30-35 minutes

---

## 🌐 Network: Celo Mainnet

We're using **Celo Mainnet** because:
- ✅ BuenoToken already deployed
- ✅ Uniswap v4 pool already deployed
- ✅ No need to redeploy everything

**Important addresses:**
- BuenaToken: `0xe9689CF0Ffe9e4c6E9955f287a91697d18Ae7676`
- Uniswap PoolManager: `0x288dc841A52FCA2707c6947B3A777c5E56cd87BC`
- StateView: `0xbc21f8720babf4b20d195ee5c6e99c52b76f2bfb`
- Universal Router: `0xcb695bc5d3aa22cad1e6df07801b061a05a0233a`
- CELO Token: `0x471EcE3750Da237f93B8E339c536989b8978a438`
- Quoter: `0x28566da1093609182dff2cb2a91cfd72e61d66cd`
- Permit2: `0x000000000022D473030F116dDEE9F6B43aC78BA3`

**Environment Variables Setup:**

Create a `.env.local` file in `packages/nextjs/` with:

```bash
# WalletConnect Project ID
# Get yours at https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

# BuenaToken (deployed on Celo Mainnet)
NEXT_PUBLIC_BUENA_TOKEN_ADDRESS=0xe9689CF0Ffe9e4c6E9955f287a91697d18Ae7676

# The Graph (if already configured)
NEXT_PUBLIC_SUBGRAPH_URL=
NEXT_PUBLIC_SUBGRAPH_API_KEY=

# Uniswap v4 Contracts on Celo Mainnet (Chain ID: 42220)
NEXT_PUBLIC_POOL_MANAGER_ADDRESS=0x288dc841A52FCA2707c6947B3A777c5E56cd87BC
NEXT_PUBLIC_STATE_VIEW_ADDRESS=0xbc21f8720babf4b20d195ee5c6e99c52b76f2bfb
NEXT_PUBLIC_UNIVERSAL_ROUTER_ADDRESS=0xcb695bc5d3aa22cad1e6df07801b061a05a0233a
NEXT_PUBLIC_CELO_TOKEN_ADDRESS=0x471EcE3750Da237f93B8E339c536989b8978a438
NEXT_PUBLIC_QUOTER_ADDRESS=0x28566da1093609182dff2cb2a91cfd72e61d66cd
NEXT_PUBLIC_PERMIT2_ADDRESS=0x000000000022D473030F116dDEE9F6B43aC78BA3

# Uniswap Pool ID for BuenaToken
NEXT_PUBLIC_POOL_ID=98

# Pool Configuration
NEXT_PUBLIC_POOL_FEE_TIER=3000
NEXT_PUBLIC_POOL_TICK_SPACING=60
```

---

## 🚀 Installation

Starting from the `ens` branch:

```bash
# Install dependencies
bun install

# Go to Next.js package
cd packages/nextjs

# Install Uniswap SDK
bun add @uniswap/v4-sdk @uniswap/sdk-core @uniswap/universal-router-sdk

# Run dev server
bun run dev
```

Now we add some modifications to the provider on `packages/nextjs/app/providers.tsx`

First we will add the celo mainnet to our chains:

```typescript
const celo = defineChain({
  id: 42220,
  name: "Celo",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://forno.celo.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Celoscan",
      url: "https://celoscan.io",
    },
  },
  iconUrl: "https://s2.coinmarketcap.com/static/img/coins/200x200/5567.png",
  testnet: false,
});
```

And add Celo to the chains config on the same archive:

```typescript
const config = getDefaultConfig({
  appName: "ZeroToDapp",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [celo, celoSepolia], // ← add Celo
  ssr: true,
});
```

---

## NEXT STEP: Create PoolInfo Component

Now we're going to create the **first component** that displays pool information.

### **Create file: `packages/nextjs/app/uniswap/components/PoolInfo.tsx`**


---

## 📝 Complete code for PoolInfo.tsx

Create the file and paste this:

```typescript
"use client";

import { encodePacked, keccak256 } from "viem";

const BUENA_TOKEN = process.env.NEXT_PUBLIC_BUENA_TOKEN_ADDRESS as `0x${string}`;
const CELO_TOKEN = process.env.NEXT_PUBLIC_CELO_TOKEN_ADDRESS as `0x${string}`;
const FEE_TIER = Number(process.env.NEXT_PUBLIC_POOL_FEE_TIER) || 3000;
const TICK_SPACING = Number(process.env.NEXT_PUBLIC_POOL_TICK_SPACING) || 60;
const HOOKS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

function computePoolId(
  token0: `0x${string}`,
  token1: `0x${string}`,
  fee: number,
  tickSpacing: number,
  hooks: `0x${string}`
): `0x${string}` {
  const [sortedToken0, sortedToken1] =
    token0.toLowerCase() < token1.toLowerCase()
      ? [token0, token1]
      : [token1, token0];

  const poolKey = encodePacked(
    ["address", "address", "uint24", "int24", "address"],
    [sortedToken0, sortedToken1, fee, tickSpacing, hooks]
  );

  return keccak256(poolKey);
}

export function PoolInfo() {
  if (!BUENA_TOKEN || !CELO_TOKEN) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">⚙️ Configuration Needed</h2>
          <p>Please set token addresses in your .env.local file:</p>
          <ul className="list-disc list-inside text-sm mt-2">
            <li>NEXT_PUBLIC_BUENA_TOKEN_ADDRESS</li>
            <li>NEXT_PUBLIC_CELO_TOKEN_ADDRESS</li>
          </ul>
        </div>
      </div>
    );
  }

  const POOL_ID = computePoolId(BUENA_TOKEN, CELO_TOKEN, FEE_TIER, TICK_SPACING, HOOKS);

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">📊 Pool Information</h2>
        <p className="text-sm opacity-70 mb-4">BuenaToken/CELO Pool</p>

        <div className="collapse collapse-arrow bg-base-300 mb-4">
          <input type="checkbox" />
          <div className="collapse-title font-medium">
            🔍 How Pool ID is Calculated
          </div>
          <div className="collapse-content">
            <div className="space-y-2 text-sm font-mono">
              <p><strong>Token0:</strong> {BUENA_TOKEN < CELO_TOKEN ? BUENA_TOKEN : CELO_TOKEN}</p>
              <p><strong>Token1:</strong> {BUENA_TOKEN < CELO_TOKEN ? CELO_TOKEN : BUENA_TOKEN}</p>
              <p><strong>Fee Tier:</strong> {FEE_TIER} ({FEE_TIER/10000}%)</p>
              <p><strong>Tick Spacing:</strong> {TICK_SPACING}</p>
              <p><strong>Hooks:</strong> {HOOKS}</p>
              <div className="divider"></div>
              <p className="mt-2"><strong>Resulting Pool ID:</strong></p>
              <p className="break-all text-xs bg-base-200 p-2 rounded">{POOL_ID}</p>
              <p className="mt-2 text-xs opacity-70">
                📝 Formula: keccak256(encodePacked(token0, token1, fee, tickSpacing, hooks))
              </p>
            </div>
          </div>
        </div>

        <div className="stats stats-vertical lg:stats-horizontal shadow">
          <div className="stat">
            <div className="stat-title">Pool ID</div>
            <div className="stat-value text-xs break-all">
              {POOL_ID.slice(0, 10)}...{POOL_ID.slice(-8)}
            </div>
            <div className="stat-desc">Computed from PoolKey</div>
          </div>

          <div className="stat">
            <div className="stat-title">Your Position</div>
            <div className="stat-value text-lg">21 BTK + 2 CELO</div>
            <div className="stat-desc">Initial deposit</div>
          </div>

          <div className="stat">
            <div className="stat-title">Pool Price</div>
            <div className="stat-value text-lg">10.5</div>
            <div className="stat-desc">BTK per CELO</div>
          </div>
        </div>

        <div className="alert alert-success mt-4">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>✅ Pool created successfully on Uniswap v4 Celo Mainnet!</span>
        </div>


      </div>
    </div>
  );
}
```

---

### **Update `packages/nextjs/app/uniswap/page.tsx`**

Now add the PoolInfo component to the Uniswap page:

**Create or update file: `packages/nextjs/app/uniswap/page.tsx`**

```typescript
import { PoolInfo } from "./components/PoolInfo";

export default function UniswapPage() {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="hero bg-primary text-primary-content py-20">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Uniswap v4 Integration
            </h1>
            <p className="text-xl opacity-80">
              Trade BuenaToken on Uniswap v4
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <PoolInfo />
        </div>
      </div>
    </div>
  );
}
```

---

## NEXT STEP: Create SwapInterface Component

Now we're going to create the **second component** that allows users to swap tokens.

### **Create file: `packages/nextjs/app/uniswap/components/SwapInterface.tsx`**

This component will provide a user interface to:
- 💱 Swap CELO for BuenaToken
- 📊 Get price quotes
- 🔄 Execute swaps using Uniswap v4

---

## 📝 Complete code for SwapInterface.tsx

Create the file and paste this:

```typescript
"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

export function SwapInterface() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");

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
            {/* Input Section */}
            <div className="bg-base-300 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium opacity-70">You pay</span>
                <span className="text-sm opacity-50">Balance: -- CELO</span>
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

            {/* Swap Arrow */}
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

            {/* Output Section */}
            <div className="bg-base-300 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium opacity-70">You receive (estimated)</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="0.0"
                  className="input input-ghost text-3xl font-bold w-full p-0 focus:outline-none bg-transparent"
                  value=""
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

            {/* Price Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-base-300 rounded-xl p-4">
                <div className="text-xs opacity-60 mb-1">Price</div>
                <div className="font-bold">-- BTK/CELO</div>
              </div>
              <div className="bg-base-300 rounded-xl p-4">
                <div className="text-xs opacity-60 mb-1">Minimum Received</div>
                <div className="font-bold">-- BTK</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                className="btn btn-outline btn-primary btn-lg"
                disabled={!amount || Number(amount) <= 0}
              >
                📊 Get Quote
              </button>
              <button
                className="btn btn-primary btn-lg"
                disabled={!amount || Number(amount) <= 0}
              >
                🔄 Swap
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
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
            <p className="font-bold mb-1">Using Uniswap v4</p>
            <p className="opacity-70">
              Swaps use the Universal Router with v4Planner for optimal execution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```


We also have to add the import in `packages/nextjs/app/uniswap/page.tsx` that includes our new `Swap` component

```typescript
import { SwapInterface } from "./components/SwapInterface";
...
          <SwapInterface />
```

---


## 📁 Step 1: Create Quoter ABI File

We need the Quoter contract ABI to get price quotes.

**Create file: `packages/nextjs/app/uniswap/lib/quoterAbi.ts`**

**Copy and paste this complete code:**

```typescript
export const QUOTER_ABI = [
  {
    inputs: [{ internalType: "contract IPoolManager", name: "_poolManager", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "PoolId", name: "poolId", type: "bytes32" }],
    name: "NotEnoughLiquidity",
    type: "error",
  },
  { inputs: [], name: "NotPoolManager", type: "error" },
  { inputs: [], name: "NotSelf", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "QuoteSwap",
    type: "error",
  },
  { inputs: [], name: "UnexpectedCallSuccess", type: "error" },
  {
    inputs: [{ internalType: "bytes", name: "revertData", type: "bytes" }],
    name: "UnexpectedRevertBytes",
    type: "error",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: "Currency", name: "currency0", type: "address" },
              { internalType: "Currency", name: "currency1", type: "address" },
              { internalType: "uint24", name: "fee", type: "uint24" },
              { internalType: "int24", name: "tickSpacing", type: "int24" },
              { internalType: "contract IHooks", name: "hooks", type: "address" },
            ],
            internalType: "struct PoolKey",
            name: "poolKey",
            type: "tuple",
          },
          { internalType: "bool", name: "zeroForOne", type: "bool" },
          { internalType: "uint128", name: "exactAmount", type: "uint128" },
          { internalType: "bytes", name: "hookData", type: "bytes" },
        ],
        internalType: "struct IV4Quoter.QuoteExactSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactInputSingle",
    outputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      { internalType: "uint256", name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
```

💰 Step 2: Fetch Token Balances

Before implementing swaps, we need to display users' token balances in real-time.

### **What you'll build:**
- 📊 Display CELO and BTK balances
- 🔄 Auto-refresh on wallet connection
- ⚡ Manual refresh button

### **Create file: `packages/nextjs/app/uniswap/lib/erc20Abi.ts`**

First, we need the standard ERC20 ABI to read token balances:

```typescript
export const ERC20_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
```

### **Create file: `packages/nextjs/app/uniswap/lib/config.ts`**

Centralize all contract addresses and configuration:

```typescript
export const BUENA_TOKEN = process.env.NEXT_PUBLIC_BUENA_TOKEN_ADDRESS || "";
export const CELO_TOKEN = process.env.NEXT_PUBLIC_CELO_TOKEN_ADDRESS || "0x471EcE3750Da237f93B8E339c536989b8978a438";
export const QUOTER_ADDRESS = process.env.NEXT_PUBLIC_QUOTER_ADDRESS || "0x28566da1093609182dff2cb2a91cfd72e61d66cd";
export const UNIVERSAL_ROUTER = process.env.NEXT_PUBLIC_UNIVERSAL_ROUTER_ADDRESS || "0xcb695bc5d3aa22cad1e6df07801b061a05a0233a";
export const PERMIT2_ADDRESS = process.env.NEXT_PUBLIC_PERMIT2_ADDRESS || "";
export const FEE_TIER = parseInt(process.env.NEXT_PUBLIC_POOL_FEE_TIER || "3000");
export const TICK_SPACING = parseInt(process.env.NEXT_PUBLIC_POOL_TICK_SPACING || "60");
export const HOOKS = process.env.NEXT_PUBLIC_HOOKS_ADDRESS || "0x0000000000000000000000000000000000000000";
export const STATE_VIEW_ADDRESS = process.env.NEXT_PUBLIC_STATE_VIEW_ADDRESS || "0xbc21f8720babf4b20d195ee5c6e99c52b76f2bfb";
export const POOL_ID = parseInt(process.env.NEXT_PUBLIC_POOL_ID || "98");
```

### **Update `SwapInterface.tsx` - Complete Code:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { formatUnits, parseEther } from "viem";
import { ERC20_ABI } from "../lib/erc20Abi";
import { BUENA_TOKEN, CELO_TOKEN } from "../lib/config";
import { QUOTER_ABI } from "../lib/quoterAbi";
import { QUOTER_ADDRESS, FEE_TIER, TICK_SPACING, HOOKS } from "../lib/config";

export function SwapInterface() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [amount, setAmount] = useState("");
  const [celoBalance, setCeloBalance] = useState<string>("0");
  const [btkBalance, setBtkBalance] = useState<string>("0");
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [quote, setQuote] = useState<string>("");
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  async function fetchBalances() {
    if (!publicClient || !address) return;

    setIsLoadingBalances(true);

    try {
      const celoBalanceResult = await publicClient.readContract({
        address: CELO_TOKEN,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });

      const btkBalanceResult = await publicClient.readContract({
        address: BUENA_TOKEN,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });

      setCeloBalance(formatUnits(celoBalanceResult, 18));
      setBtkBalance(formatUnits(btkBalanceResult, 2));
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setIsLoadingBalances(false);
    }
  }

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
      alert(`Failed to get quote: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoadingQuote(false);
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      fetchBalances();
    }
  }, [isConnected, address]);

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
                <span className="text-sm opacity-50">
                  Balance: {isLoadingBalances ? "..." : celoBalance} CELO
                </span>
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
                <span className="text-sm font-medium opacity-70">You receive (estimated)</span>
                <span className="text-sm opacity-50">
                  Balance: {isLoadingBalances ? "..." : btkBalance} BTK
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
                <div className="text-xs opacity-60 mb-1">Price</div>
                <div className="font-bold">
                  {quote && amount ? (Number(quote) / Number(amount)).toFixed(2) : "--"} BTK/CELO
                </div>
              </div>
              <div className="bg-base-300 rounded-xl p-4">
                <div className="text-xs opacity-60 mb-1">Minimum Received</div>
                <div className="font-bold">
                  {quote ? (Number(quote) * 0.995).toFixed(2) : "--"} BTK
                </div>
              </div>
            </div>

            <button
              className="btn btn-sm btn-ghost w-full"
              onClick={fetchBalances}
              disabled={isLoadingBalances}
            >
              {isLoadingBalances ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Refreshing...
                </>
              ) : (
                "🔄 Refresh Balances"
              )}
            </button>

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
              <button
                className="btn btn-primary btn-lg"
                disabled={!amount || Number(amount) <= 0}
              >
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
            <p className="font-bold mb-1">Using Uniswap v4</p>
            <p className="opacity-70">
              Swaps use the Universal Router with v4Planner for optimal execution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### **🔍 What we added:**

**New imports:**
- `usePublicClient` - For reading blockchain data
- `formatUnits` - Converts wei to human-readable numbers
- `parseEther` - Converts user input to wei
- `ERC20_ABI` - Interface for token balance calls
- `QUOTER_ABI` - Interface for getting swap quotes

**New state:**
- `celoBalance`, `btkBalance` - Store token balances
- `quote` - Stores the output amount from Quoter
- `isLoadingBalances`, `isLoadingQuote` - Loading states

**New functions:**
- `fetchBalances()` - Reads balances from ERC20 contracts
- `handleGetQuote()` - Calls Quoter to simulate swap and get output amount

**Key concepts:**
- **`readContract()`** - Read-only call to smart contract (no gas needed)
- **Token decimals** - CELO uses 18, BTK uses 2
- **zeroForOne** - Determines swap direction (tokens must be sorted)
- **Slippage** - Minimum received shows 99.5% of quote (0.5% slippage tolerance)

## ✅ **What we've built so far:**

✅ Pool information display  
✅ Token balance fetching  
✅ Quote functionality  
❌ **Swap execution** ← Next step

In the next section, we'll implement the actual swap using:
- Permit2 for token approvals
- Universal Router for swap execution
- V4Planner + RoutePlanner from Uniswap SDK

---

## 📋 Step 3: Prepare Swap Infrastructure

Before implementing the swap functionality, we need to set up the required contract ABIs and configuration.

### **3.1 - Create Permit2 ABI file**
**Create:** `packages/nextjs/app/uniswap/lib/permit2Abi.ts`


**Why Permit2?** It's a canonical contract deployed on all chains that allows users to grant token approvals once, then use them across multiple protocols.


```typescript
export const PERMIT2_ABI = [
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint160", name: "amount", type: "uint160" },
      { internalType: "uint48", name: "expiration", type: "uint48" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "allowance",
    outputs: [
      { internalType: "uint160", name: "amount", type: "uint160" },
      { internalType: "uint48", name: "expiration", type: "uint48" },
      { internalType: "uint48", name: "nonce", type: "uint48" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
```

### **3.2 - Create Universal Router ABI file**
**Create:** `packages/nextjs/app/uniswap/lib/universalRouterAbi.ts`

```typescript
export const UNIVERSAL_ROUTER_ABI = [
  {
    inputs: [
      { internalType: "bytes", name: "commands", type: "bytes" },
      { internalType: "bytes[]", name: "inputs", type: "bytes[]" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;
```



🔄 Step 3: Implement Swap Execution with Universal Router

Now we'll implement the complete swap functionality using Uniswap's Universal Router and SDK.

### **What you'll build:**
- 🔐 Permit2 approval system
- 🛠️ V4Planner to build swap actions
- ⚡ Execute swaps via Universal Router
- 📊 Transaction state management with confirmations

---

this is how the final code will look like:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseEther } from "viem";
import { Actions, V4Planner } from '@uniswap/v4-sdk';
import { CommandType, RoutePlanner } from '@uniswap/universal-router-sdk';
import { ERC20_ABI } from "../lib/erc20Abi";
import { QUOTER_ABI } from "../lib/quoterAbi";
import { BUENA_TOKEN, CELO_TOKEN,QUOTER_ADDRESS, FEE_TIER, TICK_SPACING, HOOKS, UNIVERSAL_ROUTER, PERMIT2_ADDRESS } from "../lib/config";
import { PERMIT2_ABI } from "../lib/permit2Abi";
import { UNIVERSAL_ROUTER_ABI } from "../lib/universalRouterAbi";

export function SwapInterface() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [amount, setAmount] = useState("");
  const [celoBalance, setCeloBalance] = useState<string>("0");
  const [btkBalance, setBtkBalance] = useState<string>("0");
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [quote, setQuote] = useState<string>("");
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  const [swapHash, setSwapHash] = useState<`0x${string}` | undefined>();
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: swapHash,
  });

  async function fetchBalances() {
    if (!publicClient || !address) return;

    setIsLoadingBalances(true);

    try {
      const celoBalanceResult = await publicClient.readContract({
        address: CELO_TOKEN,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });

      const btkBalanceResult = await publicClient.readContract({
        address: BUENA_TOKEN,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });

      setCeloBalance(formatUnits(celoBalanceResult, 18));
      setBtkBalance(formatUnits(btkBalanceResult, 2));
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setIsLoadingBalances(false);
    }
  }

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
      alert(`Failed to get quote: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoadingQuote(false);
    }
  }

  async function handleSwap() {
    if (!walletClient || !publicClient || !address || !quote) return;

    try {
      setIsSwapping(true);

      const amountIn = parseEther(amount);
      const quoteAmount = Number(quote) * 100;
      const amountOutMinimum = BigInt(Math.floor(quoteAmount * 0.995));

      const zeroForOne = CELO_TOKEN.toLowerCase() < BUENA_TOKEN.toLowerCase();

      const poolKey = {
        currency0: zeroForOne ? CELO_TOKEN : BUENA_TOKEN,
        currency1: zeroForOne ? BUENA_TOKEN : CELO_TOKEN,
        fee: FEE_TIER,
        tickSpacing: TICK_SPACING,
        hooks: HOOKS,
      };

      const celoBalance = await publicClient.readContract({
        address: CELO_TOKEN,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });

      if (celoBalance < amountIn) {
        alert(`Insufficient CELO balance. You have ${formatUnits(celoBalance, 18)} CELO`);
        return;
      }

      const erc20Allowance = await publicClient.readContract({
        address: CELO_TOKEN,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address, PERMIT2_ADDRESS],
      });

      if (erc20Allowance < amountIn) {
        setIsApproving(true);

        const approveTx = await walletClient.writeContract({
          address: CELO_TOKEN,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [PERMIT2_ADDRESS, BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")],
        });

        await publicClient.waitForTransactionReceipt({ hash: approveTx });
      }

      const permit2Allowance = await publicClient.readContract({
        address: PERMIT2_ADDRESS,
        abi: PERMIT2_ABI,
        functionName: "allowance",
        args: [address, CELO_TOKEN, UNIVERSAL_ROUTER],
      });

      const now = Math.floor(Date.now() / 1000);
      const needsPermit2Approval =
        permit2Allowance[0] < amountIn ||
        permit2Allowance[1] < now + 3600;

      if (needsPermit2Approval) {
        const deadline = now + 31536000;
        const maxUint160 = BigInt("0xffffffffffffffffffffffffffffffffffffffff");

        const permit2ApproveTx = await walletClient.writeContract({
          address: PERMIT2_ADDRESS,
          abi: PERMIT2_ABI,
          functionName: "approve",
          args: [CELO_TOKEN, UNIVERSAL_ROUTER, maxUint160, deadline],
        });

        await publicClient.waitForTransactionReceipt({ hash: permit2ApproveTx });
        setIsApproving(false);
      }

      const swapConfig = {
        poolKey,
        zeroForOne,
        amountIn: amountIn.toString(),
        amountOutMinimum: amountOutMinimum.toString(),
        hookData: "0x00",
      };

      const v4Planner = new V4Planner();

      v4Planner.addAction(Actions.SWAP_EXACT_IN_SINGLE, [swapConfig]);
      v4Planner.addAction(Actions.SETTLE_ALL, [poolKey.currency0, amountIn]);
      v4Planner.addAction(Actions.TAKE_ALL, [poolKey.currency1, amountOutMinimum]);

      const encodedActions = v4Planner.finalize();

      const routePlanner = new RoutePlanner();
      routePlanner.addCommand(CommandType.V4_SWAP, [encodedActions]);

      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const hash = await walletClient.writeContract({
        address: UNIVERSAL_ROUTER,
        abi: UNIVERSAL_ROUTER_ABI,
        functionName: "execute",
        args: [routePlanner.commands, [encodedActions], BigInt(deadline)],
      });

      setSwapHash(hash);
    } catch (error: any) {
      console.error("Swap failed:", error);

      let userMessage = "Swap failed: ";

      if (error.message?.includes("user rejected")) {
        userMessage += "Transaction rejected by user";
      } else if (error.message?.includes("insufficient funds")) {
        userMessage += "Insufficient funds for transaction";
      } else {
        userMessage += error.shortMessage || error.message || "Unknown error";
      }

      alert(userMessage);
    } finally {
      setIsSwapping(false);
      setIsApproving(false);
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      fetchBalances();
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (isConfirmed) {
      fetchBalances();
    }
  }, [isConfirmed]);

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
                <span className="text-sm opacity-50">
                  Balance: {isLoadingBalances ? "..." : celoBalance} CELO
                </span>
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
                <span className="text-sm font-medium opacity-70">You receive (estimated)</span>
                <span className="text-sm opacity-50">
                  Balance: {isLoadingBalances ? "..." : btkBalance} BTK
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
                <div className="text-xs opacity-60 mb-1">Price</div>
                <div className="font-bold">
                  {quote && amount ? (Number(quote) / Number(amount)).toFixed(2) : "--"} BTK/CELO
                </div>
              </div>
              <div className="bg-base-300 rounded-xl p-4">
                <div className="text-xs opacity-60 mb-1">Minimum Received</div>
                <div className="font-bold">
                  {quote ? (Number(quote) * 0.995).toFixed(2) : "--"} BTK
                </div>
              </div>
            </div>

            <button
              className="btn btn-sm btn-ghost w-full"
              onClick={fetchBalances}
              disabled={isLoadingBalances}
            >
              {isLoadingBalances ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Refreshing...
                </>
              ) : (
                "🔄 Refresh Balances"
              )}
            </button>

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
              <button
                className="btn btn-primary btn-lg"
                disabled={!quote || isApproving || isSwapping || isConfirming}
                onClick={handleSwap}
              >
                {isApproving ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Approving...
                  </>
                ) : isSwapping || isConfirming ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Swapping...
                  </>
                ) : (
                  "🔄 Swap"
                )}
              </button>
            </div>

            {(isApproving || isSwapping || isConfirming || isConfirmed) && (
              <div className="mt-4">
                {isApproving && (
                  <div className="alert alert-info">
                    <span className="loading loading-spinner"></span>
                    <span>Setting up approvals (Permit2 + Universal Router)...</span>
                  </div>
                )}
                {isSwapping && (
                  <div className="alert alert-info">
                    <span className="loading loading-spinner"></span>
                    <span>Confirm swap in your wallet...</span>
                  </div>
                )}
                {isConfirming && swapHash && (
                  <div className="alert alert-info">
                    <span className="loading loading-spinner"></span>
                    <div>
                      <p>Transaction submitted!</p>
                      <a
                        href={`https://celoscan.io/tx/${swapHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary text-sm"
                      >
                        View on Celoscan
                      </a>
                    </div>
                  </div>
                )}
                {isConfirmed && (
                  <div className="alert alert-success">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-bold">Swap successful!</p>
                      <a
                        href={`https://celoscan.io/tx/${swapHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary text-sm"
                      >
                        View transaction
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="divider"></div>

        <div className="flex items-start gap-3 p-4 bg-success/10 rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-success shrink-0 w-5 h-5 mt-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div className="text-sm">
            <p className="font-bold mb-1">Universal Router SDK Swap</p>
            <p className="opacity-70">
              Using Uniswap v4 SDK with V4Planner + RoutePlanner for proper unlock callback pattern
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```


### **3.4 - Update SwapInterface.tsx - Complete Code**

Now we'll add all the swap functionality. Here's what changes:

#### **New Imports:**
```typescript
import { useWalletClient, useWaitForTransactionReceipt } from "wagmi";
import { Actions, V4Planner } from '@uniswap/v4-sdk';
import { CommandType, RoutePlanner } from '@uniswap/universal-router-sdk';
import { PERMIT2_ABI } from "../lib/permit2Abi";
import { UNIVERSAL_ROUTER_ABI } from "../lib/universalRouterAbi";
import { UNIVERSAL_ROUTER, PERMIT2_ADDRESS } from "../lib/config";
```

**What each import does:**
- `useWalletClient` - Hook for writing transactions (swaps, approvals)
- `useWaitForTransactionReceipt` - Tracks transaction confirmation status
- `V4Planner` - SDK tool to build Uniswap v4 swap actions
- `RoutePlanner` - SDK tool to wrap actions into Universal Router commands
- `Actions` - Predefined action types (SWAP, SETTLE, TAKE)
- `CommandType` - Command types for Universal Router

#### **New State Variables:**
```typescript
const { data: walletClient } = useWalletClient();
const [swapHash, setSwapHash] = useState<`0x${string}` | undefined>();
const [isApproving, setIsApproving] = useState(false);
const [isSwapping, setIsSwapping] = useState(false);

const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
  hash: swapHash,
});
```

**What they do:**
- `walletClient` - Client for sending transactions that require signatures
- `swapHash` - Stores the transaction hash after submission
- `isApproving` - Shows when approval transactions are being processed
- `isSwapping` - Shows when swap transaction is being sent
- `isConfirming` - True while waiting for transaction confirmation on-chain
- `isConfirmed` - True when transaction is successfully confirmed

---

### **3.5 - The handleSwap Function - Step by Step**

This is the core function that executes the swap. Let's break it down:

#### **Step 1: Calculate amounts and validate balance**
```typescript
const amountIn = parseEther(amount);
const quoteAmount = Number(quote) * 100;
const amountOutMinimum = BigInt(Math.floor(quoteAmount * 0.995));

const celoBalance = await publicClient.readContract({
  address: CELO_TOKEN,
  abi: ERC20_ABI,
  functionName: "balanceOf",
  args: [address],
});

if (celoBalance < amountIn) {
  alert(`Insufficient CELO balance`);
  return;
}
```
- Converts user input to wei
- Calculates minimum output with 0.5% slippage tolerance
- Checks if user has enough CELO

#### **Step 2: First Approval - ERC20 → Permit2**
```typescript
const erc20Allowance = await publicClient.readContract({
  address: CELO_TOKEN,
  abi: ERC20_ABI,
  functionName: "allowance",
  args: [address, PERMIT2_ADDRESS],
});

if (erc20Allowance < amountIn) {
  setIsApproving(true);
  
  const approveTx = await walletClient.writeContract({
    address: CELO_TOKEN,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [PERMIT2_ADDRESS, BigInt("0xfff...")],
  });
  
  await publicClient.waitForTransactionReceipt({ hash: approveTx });
}
```
- Checks if Permit2 can spend your CELO
- If not, approves Permit2 with max allowance
- Waits for approval transaction to confirm
- **This only happens once per token**

#### **Step 3: Second Approval - Permit2 → Universal Router**
```typescript
const permit2Allowance = await publicClient.readContract({
  address: PERMIT2_ADDRESS,
  abi: PERMIT2_ABI,
  functionName: "allowance",
  args: [address, CELO_TOKEN, UNIVERSAL_ROUTER],
});

const now = Math.floor(Date.now() / 1000);
const needsPermit2Approval = 
  permit2Allowance[0] < amountIn || 
  permit2Allowance[1] < now + 3600;

if (needsPermit2Approval) {
  const deadline = now + 31536000; // 1 year
  const maxUint160 = BigInt("0xfff...");
  
  const permit2ApproveTx = await walletClient.writeContract({
    address: PERMIT2_ADDRESS,
    abi: PERMIT2_ABI,
    functionName: "approve",
    args: [CELO_TOKEN, UNIVERSAL_ROUTER, maxUint160, deadline],
  });
  
  await publicClient.waitForTransactionReceipt({ hash: permit2ApproveTx });
}
```
- Checks if Universal Router can use Permit2 to spend CELO
- Checks if approval has expired (within 1 hour)
- If needed, approves Universal Router through Permit2
- Sets 1-year expiration for the approval

#### **Step 4: Build Swap Actions with V4Planner**
```typescript
const swapConfig = {
  poolKey,
  zeroForOne,
  amountIn: amountIn.toString(),
  amountOutMinimum: amountOutMinimum.toString(),
  hookData: "0x00",
};

const v4Planner = new V4Planner();

v4Planner.addAction(Actions.SWAP_EXACT_IN_SINGLE, [swapConfig]);
v4Planner.addAction(Actions.SETTLE_ALL, [poolKey.currency0, amountIn]);
v4Planner.addAction(Actions.TAKE_ALL, [poolKey.currency1, amountOutMinimum]);

const encodedActions = v4Planner.finalize();
```

**What each action does:**
- `SWAP_EXACT_IN_SINGLE` - Executes the swap with exact input amount
- `SETTLE_ALL` - Transfers input tokens (CELO) to the pool
- `TAKE_ALL` - Withdraws output tokens (BTK) from the pool

**Why this pattern?** Uniswap v4 uses the "unlock callback" pattern where you:
1. Unlock the PoolManager
2. Perform swap inside the callback
3. Settle debts (pay input tokens)
4. Take credits (receive output tokens)

#### **Step 5: Wrap Actions in Universal Router Command**
```typescript
const routePlanner = new RoutePlanner();
routePlanner.addCommand(CommandType.V4_SWAP, [encodedActions]);

const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
```
- RoutePlanner wraps v4 actions into a Universal Router command
- `V4_SWAP` tells Universal Router this is a Uniswap v4 swap
- Deadline prevents transactions from executing if they take too long

#### **Step 6: Execute the Swap**
```typescript
const hash = await walletClient.writeContract({
  address: UNIVERSAL_ROUTER,
  abi: UNIVERSAL_ROUTER_ABI,
  functionName: "execute",
  args: [routePlanner.commands, [encodedActions], BigInt(deadline)],
});

setSwapHash(hash);
```
- Sends the transaction to Universal Router
- Universal Router will:
  1. Call PoolManager.unlock()
  2. Execute swap in callback
  3. Settle tokens
  4. Return output tokens to user
- Stores transaction hash for tracking

---

### **3.6 - Auto-Refresh Balances After Swap**

Add this new useEffect to automatically update balances when swap confirms:

```typescript
useEffect(() => {
  if (isConfirmed) {
    fetchBalances();
  }
}, [isConfirmed]);
```

This ensures your balance display updates immediately after a successful swap.

---

### **3.7 - Updated UI Elements**

#### **Swap Button:**
```typescript
<button
  className="btn btn-primary btn-lg"
  disabled={!quote || isApproving || isSwapping || isConfirming}
  onClick={handleSwap}
>
  {isApproving ? (
    <>
      <span className="loading loading-spinner loading-sm"></span>
      Approving...
    </>
  ) : isSwapping || isConfirming ? (
    <>
      <span className="loading loading-spinner loading-sm"></span>
      Swapping...
    </>
  ) : (
    "🔄 Swap"
  )}
</button>
```
- Disabled until quote is fetched
- Shows different loading states
- Changes text based on transaction phase

#### **Transaction Status Alerts:**
```typescript
{(isApproving || isSwapping || isConfirming || isConfirmed) && (
  <div className="mt-4">
    {isApproving && <div className="alert alert-info">...</div>}
    {isSwapping && <div className="alert alert-info">...</div>}
    {isConfirming && <div className="alert alert-info">...</div>}
    {isConfirmed && <div className="alert alert-success">...</div>}
  </div>
)}
```
- Shows real-time status updates
- Links to Celoscan for transaction tracking
- Success message when complete

---

### **🔍 Complete Transaction Flow:**

```
1. User clicks "Get Quote" → Quoter simulates swap
2. User clicks "Swap" → Start transaction flow
3. Check CELO balance → Ensure user has enough
4. Check ERC20 allowance → Approve Permit2 if needed (once per token)
5. Check Permit2 allowance → Approve Universal Router if needed (once per token)
6. Build V4Planner actions → SWAP + SETTLE + TAKE
7. Wrap in RoutePlanner → Create Universal Router command
8. Execute transaction → Universal Router → PoolManager → Swap!
9. Wait for confirmation → Transaction mined on-chain
10. Refresh balances → Show updated token amounts
```

---

### **🧪 Test the Complete Flow:**

1. **First-time setup:**
   - Connect wallet
   - Enter amount: `0.1`
   - Click "Get Quote"
   - Click "Swap"
   - Approve Permit2 ✅ (transaction 1)
   - Approve Universal Router ✅ (transaction 2)
   - Confirm swap ✅ (transaction 3)
   - **Total: 3 transactions**

2. **Subsequent swaps:**
   - Enter amount
   - Click "Get Quote"
   - Click "Swap"
   - Confirm swap ✅ (transaction 1)
   - **Total: 1 transaction** (approvals already done!)

---

### **✅ What We Built:**

| Feature | Status |
|---------|--------|
| Pool information display | ✅ |
| Token balance fetching | ✅ |
| Auto-refresh balances | ✅ |
| Price quotes | ✅ |
| Permit2 approvals | ✅ |
| Universal Router integration | ✅ |
| V4Planner swap building | ✅ |
| Transaction tracking | ✅ |
| Success/error handling | ✅ |
| Celoscan links | ✅ |

---

### **🎉 Congratulations!**

You've built a complete Uniswap v4 integration that:
- Uses modern approval patterns (Permit2)
- Leverages the official Uniswap SDK
- Handles the complex unlock callback pattern automatically
- Provides excellent UX with loading states and confirmations