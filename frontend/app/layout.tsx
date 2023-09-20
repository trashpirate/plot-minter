"use client";
import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { mainnet } from "wagmi/chains";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";

const config = createConfig(
  getDefaultConfig({
    // API Keys
    alchemyId: process.env.ALCHEMY_API_KEY,
    walletConnectProjectId: "ab7caa5f024ff5ca7742d7123656f4c5",

    // configured chain
    chains: [mainnet],

    // app name (required)
    appName: "Plot Minter",

    // Optional
    appDescription: "Plot Minter",
    appUrl: "app.touchfreshgrass.com",
    appIcon: "http://touchfreshgrass.com/wp-content/uploads/2023/09/cropped-cropped-image-1.png",
  })
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <title>Plot Minter</title>
      <meta
        name="description"
        content="Plots are the way to disconnect from technology, and engage with the physical world, specifically by being in nature or getting fresh air."
        key="desc"
      />

      <meta name="twitter:card" content="summary_large_image" key="twcard" />
      <meta name="twitter:creator" content="Touch Grass" key="twhandle" />

      <meta property="og:title" content="Plot NFTs" key="ogtitle" />
      <meta property="og:site_name" content="Plots Minter" key="ogsitename" />
      <meta
        property="og:description"
        content="Plots are the way to disconnect from technology, and engage with the physical world, specifically by being in nature or getting fresh air."
        key="ogdesc"
      />
      <meta property="og:url" content="https://app.touchfreshgrass.com" key="ogurl" />
      <meta
        property="og:image"
        content="http://touchfreshgrass.com/wp-content/uploads/2023/09/009_red.png"
        key="ogimage"
      />
      <meta
        property="og:image:url"
        content="http://touchfreshgrass.com/wp-content/uploads/2023/09/009_red.png"
      />
      <meta property="og:image:type" content="image/png" />
      <WagmiConfig config={config}>
        <ConnectKitProvider mode="dark">
          <body>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "105vh",
                backgroundImage: "url(website_bg.jpg)",
                backgroundSize: "cover",
                backgroundPositionX: "center",
              }}
            >
              <Navbar />
              <div style={{ flexGrow: 1 }}>{children}</div>
              <Footer />
            </div>
          </body>
        </ConnectKitProvider>
      </WagmiConfig>
    </html>
  );
}
