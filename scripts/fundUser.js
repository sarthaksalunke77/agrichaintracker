const hre = require("hardhat");

async function main() {
  // Get the first default Hardhat account (which has 10,000 ETH)
  const [sender] = await hre.ethers.getSigners();
  
  // The user's MetaMask address from the screenshots
  const userAddress = "0xef7f99057a11eb9888c56dab6ccc1606fab627b7";
  
  console.log(`Sending 100 ETH from ${sender.address} to ${userAddress}...`);
  
  // Send 100 ETH
  const tx = await sender.sendTransaction({
    to: userAddress,
    value: hre.ethers.parseEther("100.0") // 100 ETH
  });
  
  await tx.wait();
  
  console.log("Transfer successful! The user's Account 1 is now funded.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
