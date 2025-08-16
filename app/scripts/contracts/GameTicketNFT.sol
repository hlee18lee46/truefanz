import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

function getEnv(name: string, fallback?: string) {
  const v = process.env[name];
  if (v === undefined || v === "") return fallback;
  return v;
}

async function main() {
  const [deployer] = await ethers.getSigners();

  const feeBps = parseInt(getEnv("EXCHANGE_FEE_BPS", "250")!, 10); // default 2.5%
  const feeRecipient = getEnv("EXCHANGE_FEE_RECIPIENT", deployer.address)!;

  if (Number.isNaN(feeBps) || feeBps < 0 || feeBps > 1000) {
    throw new Error("EXCHANGE_FEE_BPS must be an integer between 0 and 1000 (<=10%).");
  }
  if (!ethers.utils.isAddress(feeRecipient)) {
    throw new Error("EXCHANGE_FEE_RECIPIENT must be a valid address.");
  }

  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("Fee (bps):", feeBps);
  console.log("Fee recipient:", feeRecipient);

  const Factory = await ethers.getContractFactory("TicketExchangeCHZ");
  const contract = await Factory.deploy(feeBps, feeRecipient);
  const deployTx = contract.deployTransaction;
  console.log("Deploy tx:", deployTx.hash);

  await contract.deployed();
  const address = contract.address;
  console.log("TicketExchangeCHZ deployed at:", address);

  // Explorer link (Chiliz Spicy)
  if (network.config.chainId === 88882) {
    console.log(`Explorer: https://spicy-explorer.chiliz.com/address/${address}`);
    console.log(`Tx:       https://spicy-explorer.chiliz.com/tx/${deployTx.hash}`);
  }

  // Persist address for the app
  const outDir = path.join(process.cwd(), "deployments");
  const outFile = path.join(outDir, `${network.name}.json`);
  fs.mkdirSync(outDir, { recursive: true });

  let existing: any = {};
  if (fs.existsSync(outFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(outFile, "utf8"));
    } catch {}
  }
  existing.TicketExchangeCHZ = { address, feeBps, feeRecipient, deployedAt: new Date().toISOString() };
  fs.writeFileSync(outFile, JSON.stringify(existing, null, 2));
  console.log(`Saved deployment info to ${path.relative(process.cwd(), outFile)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});