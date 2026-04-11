import hre from "hardhat";

async function main() {

  const Contract = await hre.ethers.getContractFactory("DrugSupplyChain");

  const contract = await Contract.deploy();

  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});