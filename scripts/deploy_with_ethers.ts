import { deploy } from "./ethers-lib";

/**
 * Deploy BuenoToken contract to Celo Sepolia
 *
 * Usage:
 * - Make sure you're connected to Celo Sepolia network in Remix
 * - Replace 'YOUR_DEPLOYER_ADDRESS' with your deployer address (will be set as owner)
 * - Run this script
 *
 * Example:
 * const ownerAddress = '0x1234567890123456789012345678901234567890'
 * await deploy('BuenoToken', [ownerAddress])
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
      `🔗 Explorer: https://celo-sepolia.blockscout.com/address/${result.address}`
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
