import { ethers } from "ethers";

export const PSG_NFT_ADDRESS = process.env.NEXT_PUBLIC_PSG_NFT_ADDRESS!;
const RPC = process.env.NEXT_PUBLIC_CHILIZ_RPC!;

export const psgNftAbi = [
  "function tokenURI(uint256 id) view returns (string)",
  "function ownerOf(uint256 id) view returns (address)",
];

export function getProvider() {
  return new ethers.providers.JsonRpcProvider(RPC, { chainId: 88882, name: "chiliz-spicy" });
}

export function ipfsToHttp(uri: string) {
  const gw = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";
  return uri.startsWith("ipfs://") ? gw + uri.replace("ipfs://", "") : uri;
}