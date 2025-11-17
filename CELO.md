# Celo Integration Guide

Complete guide for deploying BuenoToken on Celo Sepolia and integrating Celo branding and contract interaction functionality.

## 📋 Table of Contents

- [Overview](#overview)
- [What Was Changed](#what-was-changed)
- [Getting CELO Tokens](#getting-celo-tokens)
- [Deploying BuenoToken Contract](#deploying-buenotoken-contract)
- [Environment Variables Setup](#environment-variables-setup)
- [Frontend Contract Interaction](#frontend-contract-interaction)
- [Celo Branding Implementation](#celo-branding-implementation)
- [Celo Mainnet Details](#celo-network-details)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

## 📖 Overview

This integration adds:

- BuenoToken contract deployment on Celo Sepolia testnet
- Frontend contract interaction page (`/contract`)
- Token balance display and transfer functionality
- Token ownership display from subgraph data
- Celo branding theme (black and yellow) applied globally
- Celo Sepolia as the default network

## 🔄 What Was Changed

### Files Created

1. **Contract Interaction Components**

   - `packages/nextjs/app/contract/page.tsx` - Main contract interaction page
   - `packages/nextjs/app/contract/components/TokenBalance.tsx` - Displays connected wallet balance
   - `packages/nextjs/app/contract/components/TokenTransfer.tsx` - Transfer and mint functionality
   - `packages/nextjs/app/contract/components/TokenOwnership.tsx` - Displays token holders from subgraph

2. **Documentation**
   - `CELO.md` - This comprehensive guide

### Files Modified

1. **Deployment Scripts**

   - `scripts/deploy_with_ethers.ts` - Updated to deploy BuenoToken with owner address

2. **Configuration**

   - `packages/nextjs/tailwind.config.ts` - Added Celo theme (black/yellow colors)
   - `packages/nextjs/app/globals.css` - Added Celo theme CSS variables
   - `packages/nextjs/app/providers.tsx` - Set Celo Sepolia as default chain
   - `packages/nextjs/app/layout.tsx` - Applied Celo theme
   - `packages/nextjs/app/components/ThemeToggle.tsx` - Updated to use Celo themes
   - `packages/nextjs/app/components/Header.tsx` - Added Contract navigation link

3. **Documentation**
   - `README.md` - Added Celo Sepolia deployment instructions

## 🚰 Getting CELO Tokens

Before deploying your contract, you'll need CELO tokens on Celo Mainnet testnet to pay for gas fees.

### Faucet Drops

Get your CELO tokens at [FaucetDrops](https://faucetdrops.io/faucet/0xb34D25c41df27D62e49f975b0E854d642c5F246E?networkId=42220). Get the code during the workshop! 


### Adding Celo to MetaMask

If you haven't added Celo Sepolia to MetaMask yet:

1. Open MetaMask
2. Click the network dropdown
3. Select "Add Network" or "Add a network manually"
4. Enter the following details:

```
Network Name: Celo Mainnet
RPC URL: https://forno.celo.celo-testnet.org
Chain ID: 42220
Currency Symbol: CELO
Block Explorer: https://celo.blockscout.com
```

## 🚀 Deploying BuenoToken Contract

### Prerequisites

- MetaMask wallet with Celo Sepolia testnet tokens
- Remix IDE account (or use locally)

### Deployment Steps

1. **Open Remix IDE**

   - Visit [remix.ethereum.org](https://remix.ethereum.org/)

2. **Connect Your Wallet**

   - Click the MetaMask icon in Remix
   - Ensure you're connected to **Celo Sepolia** network
   - Make sure you have testnet tokens

3. **Upload Contract**

   - Create a new file or upload `contracts/BuenoToken.sol`
   - Copy the contract code from `contracts/BuenoToken.sol`

4. **Compile Contract**

   - Go to the "Solidity Compiler" tab
   - Select compiler version `0.8.27` or higher
   - Click "Compile BuenoToken.sol"
   - Ensure compilation succeeds without errors

5. **Deploy Contract**

   - Go to the "Deploy & Run Transactions" tab
   - Select "Injected Provider - MetaMask" as the environment
   - In the "Deploy" section, enter your deployer address in the constructor field
   - Click "Deploy"
   - Confirm the transaction in MetaMask
   - Wait for deployment confirmation

6. **Save Contract Address**
   - After deployment, copy the contract address
   - You'll need this for environment variables and subgraph configuration

### Using Deployment Script

The deployment script (`scripts/deploy_with_ethers.ts`) has been updated to automatically use the deployer address as the contract owner.

**Updated Script Content:**

```typescript
import { deploy } from "./ethers-lib";

/**
 * Deploy BuenoToken contract to Celo Sepolia
 *
 * Usage:
 * - Make sure you're connected to Celo Sepolia network in Remix
 * - Run this script
 */
(async () => {
  try {
    // Get the deployer address from the connected account
    const signer = new ethers.providers.Web3Provider(web3Provider).getSigner();
    const deployerAddress = await signer.getAddress();

    console.log(`Deploying BuenoToken with owner: ${deployerAddress}`);

    const result = await deploy("BuenoToken", [deployerAddress]);
    console.log(`✅ BuenoToken deployed successfully!`);
    console.log(`📝 Contract Address: ${result.address}`);
    console.log(
      `🔗 Explorer: https://celo.blockscout.com/address/${result.address}`
    );
    console.log(`\n⚠️  Don't forget to:`);
    console.log(
      `   1. Update packages/subgraph/networks.json with the new address`
    );
    console.log(`   2. Update NEXT_PUBLIC_BUENO_TOKEN_ADDRESS in .env.local`);
  } catch (e) {
    console.error("❌ Deployment failed:", e.message);
  }
})();
```

**To use the script:**

1. In Remix, go to the "File Explorer" tab
2. Upload `scripts/deploy_with_ethers.ts`
3. Upload `scripts/ethers-lib.ts`
4. Make sure `artifacts/BuenoToken.json` is available (compile first)
5. Run `deploy_with_ethers.ts` in the Remix console
   - The script will automatically get your connected wallet address
   - It will deploy BuenoToken with that address as the owner
   - Copy the deployed contract address from the console output
6. **Important**: Update `packages/subgraph/networks.json` with the new contract address
7. **Important**: Update `.env.local` with `NEXT_PUBLIC_BUENO_TOKEN_ADDRESS`

## 🔧 Environment Variables Setup

Create a `.env.local` file in `packages/nextjs/` directory:

```bash
# BuenoToken Contract Address
NEXT_PUBLIC_BUENO_TOKEN_ADDRESS=0xYourContractAddressHere

# The Graph Subgraph API
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/YOUR_ACCOUNT/YOUR_SUBGRAPH/version/latest

# Optional: The Graph API Key for authentication
NEXT_PUBLIC_GRAPH_API_KEY=your_api_key_here

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

### Getting Your Subgraph URL

1. Deploy your subgraph following [THEGRAPH.md](./THEGRAPH.md)
2. After deployment, go to [Subgraph Studio](https://thegraph.com/studio/)
3. Select your subgraph
4. Copy the API URL from the "Query" section
5. It will look like: `https://api.studio.thegraph.com/query/{ACCOUNT_ID}/{SUBGRAPH_NAME}/version/latest`

### Getting WalletConnect Project ID

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create an account or sign in
3. Create a new project
4. Copy the Project ID

## 🖥️ Frontend Contract Interaction

The contract interaction page has been created at `/contract` with the following components:

### Created Files

#### 1. `packages/nextjs/app/contract/page.tsx`

Main page component that displays contract information and renders all interaction components:

```typescript
import { TokenBalance } from "./components/TokenBalance";
import { TokenOwnership } from "./components/TokenOwnership";
import { TokenTransfer } from "./components/TokenTransfer";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BUENO_TOKEN_ADDRESS;

export default function ContractPage() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section className="hero min-h-[300px] bg-gradient-to-br from-primary/20 to-secondary/20">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              BuenoToken Contract
            </h1>
            <p className="text-xl opacity-80 mb-4">
              Interact with your BuenoToken contract on Celo Sepolia
            </p>
            {CONTRACT_ADDRESS && (
              <div className="alert alert-info max-w-2xl mx-auto">
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
                <div className="text-left">
                  <div className="font-bold">Contract Address:</div>
                  <div className="font-mono text-sm break-all">
                    {CONTRACT_ADDRESS}
                  </div>
                  <a
                    href={`https://celo.blockscout.com/address/${CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary text-sm mt-2 inline-block"
                  >
                    View on Blockscout →
                  </a>
                </div>
              </div>
            )}
            {!CONTRACT_ADDRESS && (
              <div className="alert alert-warning max-w-2xl mx-auto">
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
                <div>
                  <div className="font-bold">Contract not configured</div>
                  <div className="text-sm">
                    Please set NEXT_PUBLIC_BUENO_TOKEN_ADDRESS in your
                    .env.local file
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-8 md:px-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Token Balance */}
            <div>
              <TokenBalance />
            </div>

            {/* Token Transfer */}
            <div>
              <TokenTransfer />
            </div>
          </div>

          {/* Token Ownership */}
          <div className="mt-8">
            <TokenOwnership />
          </div>
        </div>
      </section>
    </div>
  );
}
```

#### 2. `packages/nextjs/app/contract/components/TokenBalance.tsx`

Component that displays the connected wallet's token balance using wagmi hooks:

```typescript
"use client";

import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import buenoTokenAbi from "../../../../../artifacts/BuenoToken.json";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_BUENO_TOKEN_ADDRESS as `0x${string}`;

export function TokenBalance() {
  const { address, isConnected } = useAccount();

  const { data: balance, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: buenoTokenAbi.abi as any,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const { data: tokenName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: buenoTokenAbi.abi as any,
    functionName: "name",
  });

  const { data: tokenSymbol } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: buenoTokenAbi.abi as any,
    functionName: "symbol",
  });

  if (!isConnected) {
    return (
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
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
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">💰 Token Balance</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="stat bg-base-300 rounded-lg p-6">
              <div className="stat-title">
                {(tokenName as string) || "BuenoToken"}
              </div>
              <div className="stat-value text-primary text-4xl">
                {balance
                  ? parseFloat(formatEther(balance as bigint)).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      }
                    )
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
```

#### 3. `packages/nextjs/app/contract/components/TokenTransfer.tsx`

Component for transferring tokens and minting (owner only):

```typescript
"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, parseEther, isAddress } from "viem";
import buenoTokenAbi from "../../../../../artifacts/BuenoToken.json";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_BUENO_TOKEN_ADDRESS as `0x${string}`;

export function TokenTransfer() {
  const { address, isConnected } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [mintRecipient, setMintRecipient] = useState("");

  const {
    writeContract: transfer,
    data: transferHash,
    isPending: isTransferPending,
    error: transferError,
  } = useWriteContract();

  const {
    writeContract: mint,
    data: mintHash,
    isPending: isMintPending,
    error: mintError,
  } = useWriteContract();

  const { isLoading: isTransferConfirming, isSuccess: isTransferSuccess } =
    useWaitForTransactionReceipt({
      hash: transferHash,
    });

  const { isLoading: isMintConfirming, isSuccess: isMintSuccess } =
    useWaitForTransactionReceipt({
      hash: mintHash,
    });

  // Check if user is owner
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: buenoTokenAbi.abi as any,
    functionName: "owner",
  });

  const isOwner =
    owner && address
      ? (owner as string).toLowerCase() === address.toLowerCase()
      : false;

  const handleTransfer = async () => {
    if (!isAddress(recipient)) {
      alert("Please enter a valid address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      transfer({
        address: CONTRACT_ADDRESS,
        abi: buenoTokenAbi.abi as any,
        functionName: "transfer",
        args: [recipient as `0x${string}`, parseEther(amount)],
      });
    } catch (error) {
      console.error("Transfer error:", error);
    }
  };

  const handleMint = async () => {
    if (!isAddress(mintRecipient)) {
      alert("Please enter a valid address");
      return;
    }

    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      mint({
        address: CONTRACT_ADDRESS,
        abi: buenoTokenAbi.abi as any,
        functionName: "mint",
        args: [mintRecipient as `0x${string}`, parseEther(mintAmount)],
      });
    } catch (error) {
      console.error("Mint error:", error);
    }
  };

  // Component includes forms for transfer and mint (owner only)
  // See full implementation in the actual file
}
```

#### 4. `packages/nextjs/app/contract/components/TokenOwnership.tsx`

Component that queries subgraph and displays all token holders:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import buenoTokenAbi from "../../../../../artifacts/BuenoToken.json";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_BUENO_TOKEN_ADDRESS as `0x${string}`;
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

// Component aggregates transfers to calculate balances
// Displays table with all token holders
// See full implementation in the actual file
```

## 🎨 Celo Branding Implementation

The application has been updated with Celo branding throughout. Here are all the changes:

### 1. Tailwind Configuration (`packages/nextjs/tailwind.config.ts`)

**Changes Made:**

Added custom Celo color palette and DaisyUI themes:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        celo: {
          yellow: "#FCFF52",
          black: "#000000",
          gold: "#FBCC5C",
          green: "#35D07F",
          blue: "#5EA33B",
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        celo: {
          primary: "#FCFF52";
          secondary: "#000000";
          accent: "#FBCC5C";
          neutral: "#1a1a1a";
          "base-100": "#ffffff";
          "base-200": "#f5f5f5";
          "base-300": "#e5e5e5";
          info: "#3b82f6";
          success: "#35D07F";
          warning: "#FBCC5C";
          error: "#ef4444";
        },
        "celo-dark": {
          primary: "#FCFF52";
          secondary: "#ffffff";
          accent: "#FBCC5C";
          neutral: "#1a1a1a";
          "base-100": "#000000";
          "base-200": "#1a1a1a";
          "base-300": "#2a2a2a";
          info: "#3b82f6";
          success: "#35D07F";
          warning: "#FBCC5C";
          error: "#ef4444";
        },
      },
      "light",
      "dark",
    ],
    darkTheme: "celo-dark",
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
};

export default config;
```

### 2. Global Styles (`packages/nextjs/app/globals.css`)

**Changes Made:**

Added Celo theme CSS variables:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ... existing styles ... */

/* Celo Theme Variables */
:root {
  --celo-yellow: #fcff52;
  --celo-black: #000000;
  --celo-gold: #fbcc5c;
  --celo-green: #35d07f;
  --celo-blue: #5ea33b;
}

[data-theme="celo"],
[data-theme="celo-dark"] {
  --p: 252 255 82; /* Celo Yellow */
  --s: 0 0 0; /* Black */
  --a: 251 204 92; /* Celo Gold */
  --n: 26 26 26;
  --b1: 255 255 255; /* Base white */
  --b2: 245 245 245;
  --b3: 229 229 229;
}

[data-theme="celo-dark"] {
  --b1: 0 0 0; /* Black base */
  --b2: 26 26 26;
  --b3: 42 42 42;
  --s: 255 255 255; /* White secondary for dark */
}
```

### 3. Providers (`packages/nextjs/app/providers.tsx`)

**Changes Made:**

Set Celo Sepolia as the initial/default chain:

```typescript
// ... existing imports ...

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={celoSepolia}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

**Change:** Changed `initialChain={celo}` to `initialChain={celoSepolia}`

### 4. Layout (`packages/nextjs/app/layout.tsx`)

**Changes Made:**

Updated theme initialization to use Celo themes:

```typescript
// In the script tag within <head>:
if (initialTheme === "dark") {
  document.documentElement.classList.add("dark");
  document.documentElement.setAttribute("data-theme", "celo-dark");
} else {
  document.documentElement.classList.remove("dark");
  document.documentElement.setAttribute("data-theme", "celo");
}
```

**Change:** Changed from `'dark'`/`'light'` to `'celo-dark'`/`'celo'`

### 5. Theme Toggle (`packages/nextjs/app/components/ThemeToggle.tsx`)

**Changes Made:**

Updated to switch between Celo themes:

```typescript
const applyTheme = (newTheme: "light" | "dark") => {
  const root = document.documentElement;
  if (newTheme === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "celo-dark");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "celo");
  }
};
```

**Change:** Changed from `'dark'`/`'light'` to `'celo-dark'`/`'celo'`

### 6. Header (`packages/nextjs/app/components/Header.tsx`)

**Changes Made:**

Added Contract navigation link:

```typescript
<ul className="menu menu-horizontal px-1 gap-2">
  <li>
    <a href="/">Home</a>
  </li>
  <li>
    <a href="/subgraph">Subgraph</a>
  </li>
  <li>
    <a href="/contract">Contract</a>
  </li>
  {/* ... rest of menu ... */}
</ul>
```

**Change:** Added new `<li>` with Contract link

## 🌐 Celo Sepolia Network Details

### Network Information

- **Network Name**: Celo Sepolia Testnet
- **Chain ID**: `11142220`
- **RPC URL**: `https://forno.celo.org`
- **Block Explorer**: [Blockscout](https://celo.blockscout.com/)
- **Native Currency**: CELO
- **Currency Symbol**: CELO
- **Decimals**: 18

### RPC Endpoints

- Primary: `https://forno.celo.org`
- Alternative: Find a list of all [RPC providers](https://docs.celo.org/tooling/nodes/overview) on Celo here.

### Block Explorer

- [Blockscout](https://celo.blockscout.com/)
- Use it to view transactions, contract addresses, and account balances

## 🔍 Troubleshooting

### Contract Not Deploying

**Issue**: Transaction fails or times out

**Solutions**:

- Ensure you have enough CELO tokens for gas (at least 0.01 CELO)
- Check you're on Celo Sepolia network
- Increase gas limit in MetaMask
- Try again after a few minutes

### Frontend Not Showing Contract

**Issue**: "Contract not configured" error

**Solutions**:

- Verify `.env.local` exists in `packages/nextjs/` directory
- Check `NEXT_PUBLIC_BUENO_TOKEN_ADDRESS` is set correctly
- Restart development server after adding/changing environment variables
- Ensure contract address starts with `0x` and is 42 characters long

### Balance Not Updating

**Issue**: Token balance doesn't refresh after transactions

**Solutions**:

- Refresh the page
- Disconnect and reconnect wallet
- Clear browser cache
- Check transaction on block explorer to confirm it succeeded

### Subgraph Not Showing Data

**Issue**: Token ownership table is empty

**Solutions**:

- Verify `NEXT_PUBLIC_SUBGRAPH_URL` is set correctly
- Check subgraph is deployed and synced in Subgraph Studio
- Ensure subgraph has indexed some transfers
- Check browser console for errors

### Network Mismatch

**Issue**: "Wrong network" error

**Solutions**:

- Ensure MetaMask is connected to Celo Sepolia
- If prompted, approve network switch
- Manually switch to Celo Sepolia in MetaMask
- Refresh the page after switching networks

### Transaction Stuck

**Issue**: Transaction pending for a long time

**Solutions**:

- Check transaction status on Blockscout
- Increase gas price in MetaMask
- Cancel and resubmit transaction
- Wait a few minutes (network congestion)

## 📚 Resources

- [Celo Documentation](https://docs.celo.org/)
- [Celo Sepolia Network Info](https://docs.celo.org/developer-resources/faucet)
- [Celo Block Explorer](https://celo.blockscout.com/)
- [Remix IDE](https://remix.ethereum.org/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [The Graph Documentation](https://thegraph.com/docs/)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs/introduction)

## 🎯 Next Steps

After deploying and setting up:

1. **Deploy Subgraph**

   - Follow [THEGRAPH.md](./THEGRAPH.md) to deploy your subgraph
   - Update `NEXT_PUBLIC_SUBGRAPH_URL` in `.env.local`
   - Wait for subgraph to sync (can take several minutes)

2. **Mint Initial Tokens**

   - As contract owner, go to `/contract` page
   - Connect your wallet (must be the contract owner)
   - Use the "Mint Tokens" section to mint tokens to test addresses
   - This will populate your subgraph with transfer events

3. **Test Transfers**

   - Transfer tokens between addresses using the transfer form
   - Verify balances update correctly
   - Check that token ownership table updates
   - Verify subgraph data updates in real-time

4. **Verify Celo Branding**

   - Check that all pages use Celo yellow and black theme
   - Test light/dark mode toggle
   - Verify navigation includes Contract link

5. **Update Subgraph Networks**

   - After deploying contract, update `packages/subgraph/networks.json`:

   ```json
   {
     "celo": {
       "BuenoToken": {
         "address": "0xYourContractAddress",
         "startBlock": 12345678
       }
     }
   }
   ```

   - Redeploy subgraph after updating

6. **Deploy to Production**
   - When ready, deploy to Celo mainnet
   - Update contract address and network configuration
   - Ensure subgraph is deployed to mainnet
   - Update environment variables for production

## 📝 Complete File Structure

After completing the setup, your project structure should include:

```
zero2dapp/
├── CELO.md (this file)
├── README.md (updated with Celo instructions)
├── scripts/
│   ├── deploy_with_ethers.ts (updated for BuenoToken)
│   └── ethers-lib.ts
├── packages/
│   └── nextjs/
│       ├── .env.local (you create this)
│       ├── app/
│       │   ├── contract/
│       │   │   ├── page.tsx (new)
│       │   │   └── components/
│       │   │       ├── TokenBalance.tsx (new)
│       │   │       ├── TokenTransfer.tsx (new)
│       │   │       └── TokenOwnership.tsx (new)
│       │   ├── components/
│       │   │   ├── Header.tsx (updated)
│       │   │   └── ThemeToggle.tsx (updated)
│       │   ├── providers.tsx (updated)
│       │   ├── layout.tsx (updated)
│       │   └── globals.css (updated)
│       └── tailwind.config.ts (updated)
└── packages/
    └── subgraph/
        └── networks.json (update after deployment)
```

## ✅ Verification Checklist

Use this checklist to verify everything is set up correctly:

- [ ] Celo Sepolia testnet tokens obtained
- [ ] BuenoToken contract deployed on Celo Sepolia
- [ ] Contract address saved
- [ ] `.env.local` file created with all required variables
- [ ] `NEXT_PUBLIC_BUENO_TOKEN_ADDRESS` set correctly
- [ ] Subgraph deployed and synced
- [ ] `NEXT_PUBLIC_SUBGRAPH_URL` set correctly
- [ ] `packages/subgraph/networks.json` updated with contract address
- [ ] Development server starts without errors
- [ ] Can navigate to `/contract` page
- [ ] Can connect wallet
- [ ] Token balance displays correctly
- [ ] Can transfer tokens
- [ ] Owner can mint tokens (if you're the owner)
- [ ] Token ownership table displays data
- [ ] Celo branding visible (yellow/black theme)
- [ ] Theme toggle works (light/dark mode)
- [ ] Navigation includes Contract link

## 🆘 Getting Help

- [Celo Discord](https://discord.gg/celo)
- [Celo Forum](https://forum.celo.org/)
- [GitHub Issues](https://github.com/celo-org/celo-blockchain/issues)
