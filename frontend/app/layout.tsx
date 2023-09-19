"use client";
import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { goerli } from "wagmi/chains";
import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";

const config = createConfig(
  getDefaultConfig({
    // API Keys
    alchemyId: process.env.ALCHEMY_API_KEY,
    walletConnectProjectId: "ab7caa5f024ff5ca7742d7123656f4c5",

    // configured chain
    chains: [goerli],

    // app name (required)
    appName: "PLATs NFT Minting Website",

    // Optional
    appDescription: "NFT Minting DApp",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's logo,no bigger than 1024x1024px (max. 1MB)
  })
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <title>App Title</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <meta name="description" content="App description" key="desc" />

      <meta name="twitter:card" content="summary_large_image" key="twcard" />
      <meta name="twitter:creator" content="creator name" key="twhandle" />

      <meta property="og:title" content="app title" key="ogtitle" />
      <meta property="og:site_name" content="site title" key="ogsitename" />
      <meta property="og:description" content="App description" key="ogdesc" />
      <meta property="og:url" content="https://website.com" key="ogurl" />
      <meta property="og:image" content="http://url.com/image.png" key="ogimage" />
      <meta property="og:image:url" content="http://url.com/image.png" />
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
