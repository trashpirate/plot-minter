import { getDefaultConfig } from "connectkit";
import { createConfig } from "wagmi";
import { goerli, mainnet, bscTestnet, bsc } from "wagmi/chains";

export default function getWagmiConfig(useTest: string) {
  if (useTest == "true") {
    const wagmiConfig = createConfig(
      getDefaultConfig({
        // API Keys
        alchemyId: process.env.ALCHEMY_API_KEY,
        walletConnectProjectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,

        // configured chain
        chains: [bscTestnet],

        // app name (required)
        appName: process.env.NEXT_PUBLIC_PROJECT_NAME as string,

        // Optional
        appDescription: process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION as string,
        appUrl: process.env.NEXT_PUBLIC_PROJECT_URL as string,
        appIcon: process.env.NEXT_PUBLIC_PROJECT_LOGO as string,
      })
    );

    return { config: wagmiConfig };
  } else {
    const wagmiConfig = createConfig(
      getDefaultConfig({
        // API Keys
        alchemyId: process.env.ALCHEMY_API_KEY,
        walletConnectProjectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,

        // configured chain
        // chains: [goerli],
        chains: [bsc],

        // app name (required)
        appName: process.env.NEXT_PUBLIC_PROJECT_NAME as string,

        // Optional
        appDescription: process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION as string,
        appUrl: process.env.NEXT_PUBLIC_PROJECT_URL as string,
        appIcon: process.env.NEXT_PUBLIC_PROJECT_LOGO as string,
      })
    );
    return { config: wagmiConfig };
  }
}
