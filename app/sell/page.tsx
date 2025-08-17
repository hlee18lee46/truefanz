"use client";

import { useMemo, useState } from "react";
import { ethers, BigNumber } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

import PSGTicketNFT from "@/lib/abis/PSGTicketNFT.json";
import PrimarySale from "@/lib/abis/PrimarySale.json";

const psgNftAbi = (PSGTicketNFT as any).abi;
const primarySaleAbi = (PrimarySale as any).abi;

const NFT_ADDRESS = process.env.NEXT_PUBLIC_PSG_NFT_ADDRESS!;
const SALE_ADDRESS = process.env.NEXT_PUBLIC_FIXED_SALE_ADDRESS!;

type ResolvedCall = {
    name: string;
    signature: string;
    buildArgs: (p: {
      nft: string;
      tokenId: ethers.BigNumber;
      priceWei: ethers.BigNumber;
      seller: string;
    }) => any[];
  };
  
  function resolveSaleCall(sale: ethers.Contract): ResolvedCall | null {
    const fnSigs = Object.keys(sale.interface?.functions || {});
    console.log("SALE_ADDRESS:", sale.address);
    console.log("Sale ABI function signatures:", fnSigs);
  
    const candidates: ResolvedCall[] = [
      // Primary options we expect
      {
        signature: "listToken(address,uint256,uint256)",
        name: "listToken",
        buildArgs: ({ nft, tokenId, priceWei }) => [nft, tokenId, priceWei],
      },
      {
        signature: "list(address,uint256,uint256)",
        name: "list",
        buildArgs: ({ nft, tokenId, priceWei }) => [nft, tokenId, priceWei],
      },
  
      // Common alternates
      {
        signature: "createListing(address,uint256,uint256)",
        name: "createListing",
        buildArgs: ({ nft, tokenId, priceWei }) => [nft, tokenId, priceWei],
      },
      {
        signature: "createListing(address,uint256,uint256,address)",
        name: "createListing",
        buildArgs: ({ nft, tokenId, priceWei, seller }) => [nft, tokenId, priceWei, seller],
      },
      {
        signature: "list(uint256,uint256)",
        name: "list",
        buildArgs: ({ tokenId, priceWei }) => [tokenId, priceWei],
      },
    ];
  
    for (const c of candidates) {
      if ((sale.interface as any).functions?.[c.signature]) return c;
    }
    return null;
  }

export default function SellPage() {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();

  const [tokenId, setTokenId] = useState("");
  const [priceCHZ, setPriceCHZ] = useState("");
  const [status, setStatus] = useState("");

  const evmWallet = useMemo(
    () => wallets.find((w) => w.walletClientType === "privy" || w.address),
    [wallets]
  );

  const getSigner = async () => {
    if (!evmWallet) throw new Error("No wallet connected");
    const injected = await evmWallet.getEthereumProvider();
    const provider = new ethers.providers.Web3Provider(injected); // ethers v5
    return provider.getSigner();
  };

  const list = async () => {
    try {
      setStatus("");

      if (!authenticated) await login();

      if (!NFT_ADDRESS || !SALE_ADDRESS) {
        setStatus("Missing NEXT_PUBLIC_PSG_NFT_ADDRESS or NEXT_PUBLIC_FIXED_SALE_ADDRESS.");
        return;
      }
      if (!tokenId || priceCHZ === "") {
        setStatus("Enter tokenId and price.");
        return;
      }

      const signer = await getSigner();
      const caller = (await signer.getAddress()).toLowerCase();

      const nft = new ethers.Contract(NFT_ADDRESS, psgNftAbi, signer);
      const sale = new ethers.Contract(SALE_ADDRESS, primarySaleAbi, signer);

      // ---- 1) Ownership check BEFORE anything else
      const onChainOwner = (await nft.ownerOf(tokenId)).toLowerCase();
      if (onChainOwner !== caller) {
        setStatus(`You don't own tokenId ${tokenId}. Owner=${onChainOwner}, you=${caller}`);
        return;
      }

      // ---- 2) Approval (set once)
      const isApproved = await nft.isApprovedForAll(caller, SALE_ADDRESS);
      if (!isApproved) {
        setStatus("Approving sale contract...");
        const txA = await nft.setApprovalForAll(SALE_ADDRESS, true);
        await txA.wait();
      }

      // ---- 3) Resolve the correct sale function & build args
      const resolved = resolveSaleCall(sale);
      if (!resolved) {
        setStatus("Sale ABI has no known list() function. See console for signatures.");
        return;
      }
      console.log("Using sale function:", resolved);

      const tid = BigNumber.from(tokenId);
      const priceWei = ethers.utils.parseUnits(priceCHZ, 18);
      const args = resolved.buildArgs({ nft: NFT_ADDRESS, tokenId: tid, priceWei, seller: caller });

      // ---- 4) Static call to catch revert reason
      try {
        // @ts-ignore dynamic call
        await sale.callStatic[resolved.name](...args);
      } catch (e: any) {
        console.error("Static call failed:", e);
        const reason = e?.error?.data ?? e?.data ?? e?.message ?? "revert";
        setStatus(`Listing would revert: ${String(reason)}`);
        return;
      }

      // ---- 5) Send tx
      setStatus("Sending listing transaction...");
      // @ts-ignore dynamic call
      const tx = await sale[resolved.name](...args /*, { gasLimit: 300000 }*/);
      await tx.wait();
      setStatus(`Listed! tx: ${tx.hash}`);
    } catch (err: any) {
      console.error(err);
      setStatus(err?.message ?? "Error while listing");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href="/marketplace" className="text-sm text-muted-foreground hover:underline">
          ← Back to marketplace
        </Link>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Sell your PSG ticket</CardTitle>
          <CardDescription>List a ticket you own (ERC721) on the fixed-price sale contract.</CardDescription>
        </CardHeader>

        <div className="px-6 pb-6 space-y-5">

          <div>
            <Label className="mb-2 block">Token ID</Label>
            <Input
              placeholder="e.g. 0"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
            />
          </div>

          <div>
            <Label className="mb-2 block">Price (CHZ)</Label>
            <Input
              placeholder="e.g. 25"
              value={priceCHZ}
              onChange={(e) => setPriceCHZ(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-primary hover:bg-primary/90" onClick={list} disabled={!ready}>
              {authenticated ? "List Ticket" : "Connect & List"}
            </Button>
            <span className="text-xs text-muted-foreground">Network: Chiliz Spicy (88882)</span>
          </div>

          {!!status && <div className="text-sm text-muted-foreground break-all">{status}</div>}
        </div>
      </Card>
    </div>
  );
}