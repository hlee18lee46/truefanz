import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const feeBps = 250; // 2.5%
  const feeRecipient = deployer.address; // replace with your treasury wallet

  const Factory = await ethers.getContractFactory("TicketExchangeCHZ");
  const exchange = await Factory.deploy(feeBps, feeRecipient);
  await exchange.deployed();

  console.log("TicketExchangeCHZ:", exchange.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
