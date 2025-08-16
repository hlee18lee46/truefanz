import { ethers, network } from "hardhat";
import "dotenv/config";

async function main() {
  const [deployer] = await ethers.getSigners();

  const TEAM_TREASURY = process.env.TEAM_TREASURY!;
  const TEAM_OWNER = process.env.TEAM_OWNER || deployer.address;
  const BASE_URI = process.env.NFT_BASE_URI || "https://example.com/psg-eth-ny/metadata/";
  const NAME = "PSG vs ETH New Yorkers";
  const SYMBOL = "PSG_ETH";

  if (!TEAM_TREASURY) throw new Error("Set TEAM_TREASURY in .env");

  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("Team owner:", TEAM_OWNER);
  console.log("Treasury:", TEAM_TREASURY);
  console.log("BaseURI:", BASE_URI);

  const Ticket = await ethers.getContractFactory("TicketNFT");
  // initial minter = deployer; will hand off to PrimarySale after deploy
  const ticket = await Ticket.deploy(NAME, SYMBOL, BASE_URI, TEAM_OWNER, deployer.address);
  await ticket.deployed();
  console.log("TicketNFT:", ticket.address);

  const Sale = await ethers.getContractFactory("PrimarySale");
  const sale = await Sale.deploy(ticket.address, TEAM_TREASURY, TEAM_OWNER);
  await sale.deployed();
  console.log("PrimarySale:", sale.address);

  // Grant minter role to sale (owner must call)
  const ticketAsOwner = ticket.connect(await ethers.getSigner(TEAM_OWNER));
  const tx = await ticketAsOwner.setMinter(sale.address);
  await tx.wait();
  console.log("TicketNFT.minter -> PrimarySale set");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});