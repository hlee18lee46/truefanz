"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";

export default function SyncWalletButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();

  const address =
    wallets.find((w) => w.walletClientType === "privy" || w.walletClientType === "metamask")
      ?.address || user?.wallet?.address;

  if (!ready) {
    return (
      <Button variant="secondary" disabled>
        <Wallet className="mr-2 h-4 w-4" />
        Checking…
      </Button>
    );
  }

  if (authenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" className="truncate max-w-[220px]">
          <Wallet className="mr-2 h-4 w-4" />
          {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Wallet synced"}
        </Button>
        <Button variant="ghost" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={login}>
      <Wallet className="mr-2 h-4 w-4" />
      Sync Wallet
    </Button>
  );
}
