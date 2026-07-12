const hre = require("hardhat");

async function main() {
  console.log("🌾 Deploying AgriSupplyChain contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`📋 Deployer address: ${deployer.address}`);
  console.log(
    `💰 Deployer balance: ${hre.ethers.formatEther(
      await hre.ethers.provider.getBalance(deployer.address)
    )} ETH\n`
  );

  const AgriSupplyChain = await hre.ethers.getContractFactory("AgriSupplyChain");
  const contract = await AgriSupplyChain.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`✅ AgriSupplyChain deployed to: ${address}`);
  console.log(`\n📝 Add this address to your frontend .env:`);
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
  console.log(`\n🌐 Network: ${hre.network.name}`);
  console.log(`🔗 Chain ID: ${hre.network.config.chainId || 31337}`);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress: address,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    `${deploymentsDir}/deployment.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\n💾 Deployment info saved to deployments/deployment.json`);

  // Also write the contract address to frontend .env
  const envContent = `VITE_CONTRACT_ADDRESS=${address}\nVITE_CHAIN_ID=31337\nVITE_RPC_URL=http://127.0.0.1:8545\n`;
  fs.writeFileSync("./frontend/.env", envContent);
  console.log(`✅ Frontend .env updated with contract address`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
