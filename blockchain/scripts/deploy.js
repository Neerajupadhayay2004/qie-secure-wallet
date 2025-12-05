const hre = require("hardhat");

async function main() {
  console.log("Deploying DeFiWithoutBorders...");

  const owner = "0x283344A0e7d2e78f11E9183fE3EBa76c42b53884";
  const oracle = "0x283344A0e7d2e78f11E9183fE3EBa76c42b53884";

  const Contract = await hre.ethers.getContractFactory("DeFiWithoutBorders");
  const contract = await Contract.deploy(owner, oracle);

  await contract.waitForDeployment();

  console.log("✔ Contract deployed at:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
