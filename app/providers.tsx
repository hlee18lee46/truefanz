"use client";

import React from "react";
import {
  PrivyProvider as RealPrivyProvider,
  usePrivy as usePrivyHook,
  useWallets as useWalletsHook,
} from "@privy-io/react-auth";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";

type SociosWalletContextType = {
  connectSocios: () => Promise<void>;
  sociosProvider: ethers.providers.Web3Provider | null;
  sociosAddress: string | null;
};

const SociosWalletContext = React.createContext<SociosWalletContextType>({
  connectSocios: async () => {},
  sociosProvider: null,
  sociosAddress: null,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [sociosProvider, setSociosProvider] = React.useState<ethers.providers.Web3Provider | null>(null);
  const [sociosAddress, setSociosAddress] = React.useState<string | null>(null);

  const connectSocios = async () => {
    const wcProvider = new WalletConnectProvider({ rpc: { 88882: "https://spicy-rpc.chiliz.com" }, chainId: 88882 });
    await wcProvider.enable();
    const provider = new ethers.providers.Web3Provider(wcProvider);
    const signer = provider.getSigner();
    setSociosProvider(provider);
    setSociosAddress(await signer.getAddress());
  };

  // Flatten to an array that already has stable keys assigned by React
  const normalized = React.Children.toArray(children);

  return (
    <SociosWalletContext.Provider value={{ connectSocios, sociosProvider, sociosAddress }}>
      <RealPrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
        config={{
          loginMethods: ["wallet"],
          externalWallets: true,
          embeddedWallets: { createOnLogin: "off" },
          appearance: { theme: "dark" },
        }}
      >
        {/* Give Privy exactly one DOM root that contains a keyed array of children */}
        <div id="app-root">{normalized}</div>
      </RealPrivyProvider>
    </SociosWalletContext.Provider>
  );
}

export const usePrivy = usePrivyHook;
export const useWallets = useWalletsHook;
export const useSociosWallet = () => React.useContext(SociosWalletContext);