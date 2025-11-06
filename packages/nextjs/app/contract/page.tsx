import { ENSProfile } from "./components/ENSProfile";
import { TokenBalance } from "./components/TokenBalance";
import { TokenOwnership } from "./components/TokenOwnership";
import { TokenTransfer } from "./components/TokenTransfer";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BUENA_TOKEN_ADDRESS;

export default function ContractPage() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section className="hero min-h-[300px] bg-gradient-to-br from-primary/20 to-secondary/20">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              BuenaToken Contract
            </h1>
            <p className="text-xl opacity-80 mb-4">
              Interact with your BuenaToken contract on Celo Sepolia
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
                    href={`https://celo-sepolia.blockscout.com/address/${CONTRACT_ADDRESS}`}
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
                    Please set NEXT_PUBLIC_BUENA_TOKEN_ADDRESS in your
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
            {/* ENS Profile */}
            <div className="space-y-6">
              <ENSProfile />
            </div>

            {/* Token */}
            <div>
              <TokenBalance />
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
