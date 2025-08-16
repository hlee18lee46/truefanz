// scripts/pinOneV3.ts
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pinataSDK from '@pinata/sdk';

const JWT = (process.env.PINATA_JWT || '').replace(/\s+/g, '');
if (!JWT) {
  throw new Error('Missing PINATA_JWT in .env');
}

const fileArg = process.argv[2];
// default to one of your local files if no arg passed
const filePath = fileArg || './metadata/psg-ny-2025-01/A-1-1.json';

if (!fs.existsSync(filePath)) {
  throw new Error(`File not found: ${filePath}`);
}

async function main() {
  const pinata = new pinataSDK({ pinataJWTKey: JWT });

  // (Optional) simple auth check
  try {
    await pinata.testAuthentication();
  } catch (e) {
    console.error('Pinata auth failed. Is PINATA_JWT valid?');
    throw e;
  }

  const stream = fs.createReadStream(filePath);
  const name = path.basename(filePath);

  const result = await pinata.pinFileToIPFS(stream, {
    pinataMetadata: { name },
  });

  // result: { IpfsHash, PinSize, Timestamp }
  console.log('Pinned OK:', result);
  console.log('CID:', result.IpfsHash);
  console.log('ipfs://', result.IpfsHash);
  console.log('Gateway (example): https://gateway.pinata.cloud/ipfs/' + result.IpfsHash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});