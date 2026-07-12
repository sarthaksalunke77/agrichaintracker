const { ethers } = require("ethers");
const fs = require("fs");

function main() {
  const wallet = ethers.Wallet.createRandom();
  console.log("Created new deployment wallet!");
  console.log("Address:", wallet.address);
  
  const envContent = `SEPOLIA_PRIVATE_KEY=${wallet.privateKey}\n`;
  fs.writeFileSync(".env.deploy", envContent);
  console.log("Saved private key to .env.deploy");
}

main();
