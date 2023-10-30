import { getDefaultConfig } from "connectkit";
import { createConfig } from "wagmi";
import { goerli, mainnet } from "wagmi/chains";

export default function getWagmiConfig(useTest: string) {
  if (useTest == "true") {
    const wagmiConfig = createConfig(
      getDefaultConfig({
        // API Keys
        alchemyId: process.env.ALCHEMY_API_KEY,
        walletConnectProjectId: "ab7caa5f024ff5ca7742d7123656f4c5",

        // configured chain
        // chains: [goerli],
        chains: [goerli],

        // app name (required)
        appName: "Plot Minter",

        // Optional
        appDescription: "Plot Minter",
        appUrl: "app.touchfreshgrass.com",
        appIcon: "http://app.touchfreshgrass.com/logo.png",
      })
    );

    return { config: wagmiConfig };
  } else {
    const wagmiConfig = createConfig(
      getDefaultConfig({
        // API Keys
        alchemyId: process.env.ALCHEMY_API_KEY,
        walletConnectProjectId: "ab7caa5f024ff5ca7742d7123656f4c5",

        // configured chain
        // chains: [goerli],
        chains: [mainnet],

        // app name (required)
        appName: "Plot Minter",

        // Optional
        appDescription: "Plot Minter",
        appUrl: "app.touchfreshgrass.com",
        appIcon:
          "http://touchfreshgrass.com/wp-content/uploads/2023/09/cropped-cropped-image-1.png",
      })
    );
    return { config: wagmiConfig };
  }
}
