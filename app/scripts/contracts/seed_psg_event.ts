import { ethers, network } from "hardhat";
import "dotenv/config";

function makeLabels(): string[] {
  const sections = ["A", "B", "C", "D"];   // 4 sections
  const rows = 25;                          // 25 rows
  const seatsPerRow = 10;                   // 10 seats
  const labels: string[] = [];
  for (const sec of sections) {
    for (let r = 1; r <= rows; r++) {
      for (let s = 1; s <= seatsPerRow; s++) {
        labels.push(`${sec}-${String(r).padStart(2, "0")}-${String(s).padStart(2, "0")}`);
      }
    }
  }
  return labels; // total 4*25*10 = 1000
}

async function main() {
  const SALE_ADDRESS = process.env.PRIMARY_SALE!;
  const PRICE_CHZ = process.env.PRICE_CHZ || "250"; // 250 CHZ per ticket

  if (!SALE_ADDRESS) throw new Error("Set PRIMARY_SALE in .env");
  const priceWei = ethers.utils.parseEther(PRICE_CHZ);

  const sale = await ethers.getContractAt("PrimarySale", SALE_ADDRESS);

  const labels = makeLabels();
  const batch = 200; // avoid running out of gas; list in chunks
  console.log(`Listing ${labels.length} seats @ ${PRICE_CHZ} CHZ (wei: ${priceWei.toString()}) on ${network.name}`);

  for (let i = 0; i < labels.length; i += batch) {
    const slice = labels.slice(i, i + batch);
    const tx = await sale.batchListSeats(slice, priceWei);
    const rcpt = await tx.wait();
    console.log(`Listed seats ${i}..${Math.min(labels.length, i + batch) - 1} tx=${rcpt.transactionHash}`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});