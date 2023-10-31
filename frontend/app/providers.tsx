"use client";
import { WagmiConfig } from "wagmi";
import { useEffect, useState } from "react";
import getWagmiConfig from "./config";
import { ConnectKitProvider } from "connectkit";

const dAppInfo = {
  appName: "Flame Minter",
};

export function Providers({ children }: { children: React.ReactNode }) {
  const myWagmiConfig = getWagmiConfig(process.env.NEXT_PUBLIC_TESTNET as string);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={myWagmiConfig.config}>
      <ConnectKitProvider mode="dark">{mounted && children}</ConnectKitProvider>
    </WagmiConfig>
  );
}
