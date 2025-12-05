const hre = require("hardhat");

async function main() {
  const contractAddress = "PASTE_CONTRACT";
  const payee = "0xReceiverAddress";
  const token = "TOKEN_ADDRESS";
  const amount = hre.ethers.parseUnits("10", 18); // 10 tokens

  const Contract = await hre.ethers.getContractAt(
    "DeFiWithoutBorders",
    contractAddress
  );

  const tx = await Contract.createEscrow(
    payee,
    token,
    amount,
    "0x123" // metadata hash
  );

  console.log("✔ Escrow Created:", tx.hash);
}

main().catch(console.error);
