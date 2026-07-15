const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x9e79479b0273936F6e4724412fDe642a63bc0AC7";
  const AgriSupplyChain = await ethers.getContractFactory("AgriSupplyChain");
  const contract = AgriSupplyChain.attach(contractAddress);

  const count = await contract.getBatchCount();
  console.log("Total Batches on Sepolia:", count.toString());
  
  if (count > 0) {
     const meta = await contract.getBatchMeta(1);
     console.log("Batch 1 Meta:", meta);
  }
}

main().catch(console.error);
