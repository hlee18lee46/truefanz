import { ethers } from "hardhat";

async function main() {
  const PSGTicketNFT = await ethers.getContractFactory("PSGTicketNFT");
  const contract = await PSGTicketNFT.deploy(
    "PSG Tickets",     // name
    "PSGT",            // symbol
    "https://gateway.pinata.cloud/ipfs/<your-base-uri>/" // baseURI
  );

  await contract.waitForDeployment();
  console.log("PSGTicketNFT deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});