import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pinataSDK from '@pinata/sdk';

async function main() {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error('PINATA_JWT missing');

  const pinata = new (pinataSDK as any)({ pinataJWTKey: jwt });

  const filePath = path.resolve('metadata/psg-ny-2025-01/A-1-1.json');
  const stream = fs.createReadStream(filePath);

  const res = await pinata.pinFileToIPFS(stream, {
    pinataMetadata: { name: 'A-1-1.json' },
    pinataOptions: { cidVersion: 1 },
  });

  console.log('Pinned:', res);
  console.log('CID:', res.IpfsHash);
  console.log('Gateway URL:', `https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`);
}
main().catch(console.error);