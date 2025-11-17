# ZeroToDapp Monorepo

A monorepo for building decentralized applications with smart contracts, a Next.js frontend, and The Graph subgraph indexing.

## Project Structure

```
zero2dapp/
├── packages/
│   ├── nextjs/          # Next.js frontend application
│   └── subgraph/        # The Graph protocol subgraph
├── contracts/           # Smart contracts
├── scripts/            # Deployment and utility scripts
├── tests/              # Contract tests
└── artifacts/          # Compiled contract artifacts
```

## Getting Started

### Install Dependencies

From the root of the monorepo:

```bash
npm install
```

This will install dependencies for all packages in the monorepo.

### Next.js Frontend

Run the Next.js development server:

```bash
npm run dev:nextjs
```

Or navigate to the package and run directly:

```bash
cd packages/nextjs
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Subgraph

To set up your subgraph, navigate to the subgraph package and initialize:

```bash
cd packages/subgraph
graph init
```

See the [subgraph README](./packages/subgraph/README.md) for detailed instructions.

### Smart Contracts

Your smart contracts are located in the `contracts/` directory. Use the scripts in the `scripts/` directory to deploy them.

#### Deploying to Celo Sepolia

To deploy BuenoToken to Celo Sepolia testnet:

1. **Get Testnet Tokens**

   - Visit the [Celo Sepolia Faucet](https://faucet.celo.org/) or [Alchemy Celo Sepolia Faucet](https://sepoliafaucet.com/)
   - Connect your wallet and request testnet CELO tokens
   - You'll need tokens to pay for gas fees

2. **Deploy Using Remix**

   - Open [Remix IDE](https://remix.ethereum.org/)
   - Connect your wallet (MetaMask) to Celo Sepolia testnet
   - Upload and compile `contracts/BuenoToken.sol`
   - Run `scripts/deploy_with_ethers.ts` in Remix
   - Copy the deployed contract address

3. **Update Environment Variables**

   - Copy `.env.local.example` to `.env.local` in `packages/nextjs/`
   - Set `NEXT_PUBLIC_BUENA_TOKEN_ADDRESS` to your deployed contract address

4. **Update Subgraph**
   - Update `packages/subgraph/networks.json` with your contract address
   - Redeploy your subgraph (see [THEGRAPH.md](./THEGRAPH.md))

For detailed Celo-specific instructions, see [CELO.md](./CELO.md).

## Workspace Commands

The monorepo is set up with npm workspaces. You can run commands for specific packages:

- `npm run dev:nextjs` - Start Next.js development server
- `npm run build:nextjs` - Build Next.js for production
- `npm run dev:subgraph` - Run subgraph development commands
- `npm run build:subgraph` - Build the subgraph

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [The Graph Documentation](https://thegraph.com/docs/)
- [Solidity Documentation](https://docs.soliditylang.org/)
