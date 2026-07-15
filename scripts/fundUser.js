const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env.deploy" });

async function main() {
  const userAddress = "0xef7f99057a11eb9888c56dab6ccc1606fab627b7";
  const amountToSend = ethers.parseEther("0.02"); // Send 0.02 ETH

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("Deployment wallet balance:", ethers.formatEther(balance), "ETH");

  if (balance < amountToSend) {
    console.error("Not enough ETH in deployment wallet to fund user.");
    return;
  }

  console.log(`Sending 0.02 Sepolia ETH to ${userAddress}...`);

  const tx = await deployer.sendTransaction({
    to: userAddress,
    value: amountToSend,
  });

  console.log("Transaction Hash:", tx.hash);
  console.log("Waiting for confirmation...");
  
  await tx.wait();
  
  console.log("✅ Successfully funded user wallet!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
