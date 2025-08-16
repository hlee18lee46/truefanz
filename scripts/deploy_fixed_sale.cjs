// scripts/deploy_fixed_sale.js
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const NFT_ADDRESS = process.env.PSG_NFT_ADDRESS;
  const TREASURY = process.env.PSG_TREASURY || process.env.EXCHANGE_FEE_RECIPIENT;
  const FEE_BPS = parseInt(process.env.EXCHANGE_FEE_BPS || "250", 10);

  if (!NFT_ADDRESS) throw new Error("Missing PSG_NFT_ADDRESS in .env");
  if (!TREASURY) throw new Error("Missing PSG_TREASURY or EXCHANGE_FEE_RECIPIENT in .env");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // If your contract name differs (e.g., FixedPriceSale), change "PrimarySale" below.
  const Sale = await ethers.getContractFactory("PrimarySale");
  const sale = await Sale.deploy(NFT_ADDRESS, TREASURY, FEE_BPS);
  await sale.deployed();

  console.log("PrimarySale deployed at:", sale.address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});