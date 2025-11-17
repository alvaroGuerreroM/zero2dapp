"use client";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  arbitrum,
  base,
  celoSepolia as celoSepoliaTestnet,
  celo as celoMainnet,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "wagmi/chains";

// Override Celo mainnet with icon
const celo = {
  ...celoMainnet,
  iconUrl: "https://s2.coinmarketcap.com/static/img/coins/200x200/5567.png",
};

// Override Celo Sepolia Testnet with icon
const celoSepolia = {
  ...celoSepoliaTestnet,
  iconUrl: "https://cryptologos.cc/logos/celo-celo-logo.svg?v=029",
};

const wagmiConfig = getDefaultConfig({
  appName: "ZeroToDapp",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [
    mainnet,
    sepolia,
    polygon,
    optimism,
    arbitrum,
    base,
    celo,
    celoSepolia,
  ],
  ssr: true,
});

// React Query setup
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={celoSepolia}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
