import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("Deploying DEX contract...");

  // Deploy DEX contract
  const DEX = await ethers.getContractFactory("DEX");
  const dex = await DEX.deploy();
  await dex.deployed();

  console.log(`DEX deployed to: ${dex.address}`);

  // Save the contract addresses and ABIs
  const deployment = {
    DEX: {
      address: dex.address,
      abi: JSON.parse(dex.interface.format('json') as string)
    }
  };

  // Save deployment info
  const deploymentPath = join(__dirname, "..", "frontend", "config", "deployment.json");
  writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log(`Deployment info saved to: ${deploymentPath}`);

  // Add some initial supported tokens (for testing)
  const supportedTokens = [
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"  // WETH
  ];

  console.log("Adding supported tokens...");
  for (const token of supportedTokens) {
    await dex.addSupportedToken(token);
    console.log(`Added support for token: ${token}`);
  }

  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
