"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, CheckCircle, XCircle, ScanLine, Ticket, User, Clock, AlertTriangle } from "lucide-react";

const QrReader = dynamic(() => import("react-qr-reader").then((m: any) => m.QrReader), { ssr: false });

const TEAM_WALLETS = (process.env.NEXT_PUBLIC_TEAM_WALLETS || "")
  .split(",")
  .map((a) => a.trim().toLowerCase())
  .filter(Boolean);

type VerifyResult =
  | { ok: true; recovered: string; tokenId: string | number }
  | { ok: false; reason: string; recovered?: string; owner?: string; message?: string };

export default function TeamScannerPage() {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();

  const [address, setAddress] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [scanError, setScanError] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [lastScanned, setLastScanned] = useState<string>("");

  const evmWallet = useMemo(
    () => wallets.find((w) => w.walletClientType === "privy" || w.address),
    [wallets]
  );

  useEffect(() => {
    (async () => {
      try {
        if (!ready) return;
        if (!authenticated) {
          setAuthError("");
          return;
        }
        if (!evmWallet) return;
        const provider = await evmWallet.getEthereumProvider();
        const addr = provider.selectedAddress || evmWallet.address;
        if (!addr) return;
        setAddress(addr);
      } catch (e: any) {
        setAuthError(e?.message || "Wallet error");
      }
    })();
  }, [ready, authenticated, evmWallet]);

  const isTeam = address && TEAM_WALLETS.includes(address.toLowerCase());

  const handleScan = async (text?: string | null) => {
    if (!text || text === lastScanned) return; // basic de-dupe
    setLastScanned(text);
    setScanError("");
    setVerifying(true);
    setResult(null);

    try {
      const envelope = JSON.parse(text); // { payload, signature }
      const res = await fetch("/api/verify-qr", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(envelope),
      });
      const json = (await res.json()) as VerifyResult;
      setResult(json);
    } catch (e: any) {
      setScanError(e?.message || "Invalid QR");
    } finally {
      setVerifying(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setScanError("");
    setLastScanned("");
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-sans">Team Scanner</h1>
        </div>
        <Link href="/marketplace" className="text-sm text-muted-foreground hover:underline">
          Back to marketplace
        </Link>
      </div>

      {!ready ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">Loading…</CardContent>
        </Card>
      ) : !authenticated ? (
        <Card>
          <CardContent className="py-8 text-center space-y-3">
            <p className="text-muted-foreground">Sign in with the team wallet to scan tickets.</p>
            <Button className="bg-primary" onClick={login}>Sign in</Button>
          </CardContent>
        </Card>
      ) : !isTeam ? (
        <Card>
          <CardContent className="py-8 text-center space-y-3">
            <AlertTriangle className="h-6 w-6 text-orange-500 mx-auto" />
            <p className="font-semibold">Not authorized</p>
            <p className="text-sm text-muted-foreground">This page is restricted to team wallets only.</p>
            {!!authError && <p className="text-xs text-red-500">{authError}</p>}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="h-5 w-5 text-primary" />
                Scan Fan QR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg overflow-hidden">
                <QrReader
                  constraints={{ facingMode: "environment" }}
                  onResult={(r: any, err: any) => {
                    if (r?.getText) handleScan(r.getText());
                    // ignore frame errors
                  }}
                  style={{ width: "100%" }}
                />
              </div>

              {/* Manual paste fallback */}
              <textarea
                className="w-full p-3 rounded border bg-background text-sm"
                placeholder='Or paste scanned JSON here: {"payload":{...},"signature":"0x..."}'
                rows={4}
                onChange={(e) => setLastScanned(e.target.value)}
                value={lastScanned}
              />
              <div className="flex items-center gap-2">
                <Button onClick={() => handleScan(lastScanned)} disabled={!lastScanned || verifying}>
                  Verify pasted QR
                </Button>
                <Button variant="outline" onClick={resetScan}>Reset</Button>
              </div>

              {verifying && (
                <div className="text-sm text-muted-foreground">Verifying…</div>
              )}
              {!!scanError && (
                <div className="text-sm text-red-600">{scanError}</div>
              )}
            </CardContent>
          </Card>

          {/* Result */}
          {result && (
            <Card className={result.ok ? "border-green-500" : "border-red-500"}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  {result.ok ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>PASS — Admit fan</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span>FAIL — Do not admit</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {result.ok ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      <span>Token ID: <b>{String(result.tokenId)}</b></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Owner (recovered): <b>{result.recovered}</b></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Verified at: {new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="pt-2 flex gap-2">
                      <Button className="bg-green-600 hover:bg-green-700" onClick={resetScan}>Admit Next</Button>
                      <Button variant="outline" onClick={resetScan}>Scan Again</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground">Reason: <b>{("reason" in result) ? result.reason : "unknown"}</b></p>
                    {"owner" in result && result.owner && (
                      <p className="text-muted-foreground">On-chain owner: {result.owner}</p>
                    )}
                    {"recovered" in result && result.recovered && (
                      <p className="text-muted-foreground">Recovered signer: {result.recovered}</p>
                    )}
                    <div className="pt-2">
                      <Button variant="outline" onClick={resetScan}>Try Again</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}