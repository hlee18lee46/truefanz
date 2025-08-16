const hre = require("hardhat");

function makeSeats(n) {
  return Array.from({ length: n }, (_, i) => `Seat-${i + 1}`);
}

async function main() {
  const psgWallet = process.env.PSG_WALLET;
  const baseURI = process.env.TICKET_BASE_URI || "ipfs://your-cid/";

  if (!psgWallet) throw new Error("Set PSG_WALLET in .env");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const Factory = await hre.ethers.getContractFactory("PSGTicketNFT");
  const nft = await Factory.deploy(
    "PSG vs ETH New Yorkers",
    "PSGTIX",
    baseURI,
    deployer.address,
    deployer.address
  );
  await nft.deployed();
  console.log("PSGTicketNFT:", nft.address);

  const seats = makeSeats(1000);
  const chunkSize = 100;

  for (let i = 0; i < seats.length; i += chunkSize) {
    const batch = seats.slice(i, i + chunkSize);
    const tx = await nft.batchMintWithSeats(psgWallet, batch);
    await tx.wait();
    console.log(`Minted ${Math.min(i + chunkSize, seats.length)} / ${seats.length}`);
  }

  const minted = await nft.totalMinted();
  console.log("Total minted:", minted.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});