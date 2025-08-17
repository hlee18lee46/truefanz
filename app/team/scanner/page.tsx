"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { ethers } from "ethers";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { recoverSigner, isExpired, TicketEnvelope } from "@/lib/qr/verify";
import PSGTicketNFT from "@/lib/abis/PSGTicketNFT.json";

const NFT_ADDRESS = process.env.NEXT_PUBLIC_PSG_NFT_ADDRESS!;
const TEAM_WALLETS = (process.env.NEXT_PUBLIC_TEAM_WALLETS || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
// optional: read-only RPC for fast reads
const RPC_URL = process.env.NEXT_PUBLIC_CHILIZ_RPC || "";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const startedRef = useRef(false);
  const [cameraError, setCameraError] = useState("");
  const [rawText, setRawText] = useState("");
  const [envelope, setEnvelope] = useState<TicketEnvelope | null>(null);
  const [verified, setVerified] = useState<null | { signer: string; ownerOnChain: string; ok: boolean; reason?: string }>(null);
  const [scanning, setScanning] = useState(true);

  // ---- Gate: team wallets only (optional UI check; you may already guard route higher up)
  // If you use Privy, read the connected EOA here and compare to TEAM_WALLETS.
  // For brevity, this sample doesn’t include Privy hooks.

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const start = async () => {
      try {
        readerRef.current = new BrowserMultiFormatReader();
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === "videoinput");
        const preferred = videoInputs.find(d => /back|rear|environment/i.test(d.label))?.deviceId || videoInputs[0]?.deviceId;

        const video = videoRef.current!;
        await readerRef.current.decodeFromVideoDevice(
          preferred ?? null,
          video,
          (result, err) => {
            if (result) {
              const text = result.getText();
              setRawText(text);
              try {
                const parsed = JSON.parse(text) as TicketEnvelope;
                setEnvelope(parsed);
              } catch {
                setEnvelope(null); // not JSON; show raw
              }
            }
            // ignore decode errors; they happen frequently while scanning
          }
        );
      } catch (e: any) {
        console.error(e);
        setCameraError(e?.message || String(e));
      }
    };

    start();

    return () => {
      setScanning(false);
      if (readerRef.current) {
        readerRef.current.reset();
        readerRef.current = null;
      }
    };
  }, []);

  // Verify on every valid envelope
  useEffect(() => {
    (async () => {
      if (!envelope) {
        setVerified(null);
        return;
      }
      try {
        // 1) expiry
        if (isExpired(envelope)) {
          setVerified({ signer: "", ownerOnChain: "", ok: false, reason: "QR expired" });
          return;
        }

        // 2) recover signer from signature
        const signer = recoverSigner(envelope);
        const expectedOwner = envelope.payload.owner.toLowerCase();
        if (signer.toLowerCase() !== expectedOwner) {
          setVerified({ signer, ownerOnChain: "", ok: false, reason: "Signature does not match payload.owner" });
          return;
        }

        // 3) on-chain ownership check
        const provider = RPC_URL
          ? new ethers.providers.JsonRpcProvider(RPC_URL)
          : new ethers.providers.Web3Provider((window as any).ethereum);
        const nft = new ethers.Contract(NFT_ADDRESS, (PSGTicketNFT as any).abi, provider);
        const ownerOnChain = (await nft.ownerOf(envelope.payload.ticketId)).toLowerCase();

        const ok = ownerOnChain === expectedOwner;
        setVerified({ signer, ownerOnChain, ok, reason: ok ? undefined : "ownerOf() mismatch" });
      } catch (e: any) {
        console.error(e);
        setVerified({ signer: "", ownerOnChain: "", ok: false, reason: e?.message || "verify error" });
      }
    })();
  }, [envelope]);

  const statusBadge = useMemo(() => {
    if (!envelope) return <Badge variant="secondary">Waiting for QR…</Badge>;
    if (verified?.ok) return <Badge className="bg-green-600 text-white">Valid</Badge>;
    if (verified && verified.ok === false) return <Badge className="bg-red-600 text-white">Invalid</Badge>;
    return <Badge variant="secondary">Verifying…</Badge>;
  }, [envelope, verified]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/marketplace" className="text-sm text-muted-foreground hover:underline">← Back</Link>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Scan Fan QR</CardTitle>
          <CardDescription>Point camera at the fan’s rotating ticket QR.</CardDescription>
        </CardHeader>

        <div className="p-4 grid md:grid-cols-2 gap-6">
          <div className="rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              muted
              playsInline
              autoPlay
            />
          </div>

          <div className="space-y-3">
            <div>Scan Status: {statusBadge}</div>

            {cameraError && (
              <div className="text-sm text-red-600">Camera error: {cameraError}</div>
            )}

            <div className="text-xs text-muted-foreground break-words">
              <div className="font-semibold mb-1">Raw scan:</div>
              <pre className="whitespace-pre-wrap">{rawText || "(no data)"}</pre>
            </div>

            {envelope && (
              <>
                <div className="text-sm">
                  <div><b>ticketId:</b> {envelope.payload.ticketId}</div>
                  <div><b>owner (payload):</b> {envelope.payload.owner}</div>
                  <div><b>exp:</b> {new Date(envelope.payload.exp * 1000).toLocaleTimeString()}</div>
                  <div><b>signer (recovered):</b> {verified?.signer || "…"} </div>
                  <div><b>ownerOnChain:</b> {verified?.ownerOnChain || "…"} </div>
                  {verified?.reason && <div className="text-red-600"><b>reason:</b> {verified.reason}</div>}
                </div>

                {/* Example: mark attendance on success (you can call your backend or contract here) */}
                <div className="flex gap-2 pt-2">
                  <Button
                    disabled={!verified?.ok}
                    onClick={() => alert("Attendance confirmed (demo). Call your contract or API here.")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Confirm Entry
                  </Button>
                  <Button variant="outline" onClick={() => { setEnvelope(null); setRawText(""); }}>
                    Clear
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}