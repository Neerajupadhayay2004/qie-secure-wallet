
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x283344A0e7d2e78f11E9183fE3EBa76c42b53884";

  const Contract = await hre.ethers.getContractAt(
    "DeFiWithoutBorders",
    contractAddress
  );

  const token = "TOKEN_ADDRESS"; // USDT/USDC/DAI/QIE

  await Contract.addSupportedToken(token);

  console.log("✔ Token Added:", token);
}

main().catch(console.error);
