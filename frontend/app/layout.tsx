import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/footer";
import { Providers } from "./providers";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.touchfreshgrass.com"),
  title: "Plot NFTs",
  description:
    "Plots are the way to disconnect from technology, and engage with the physical world, specifically by being in nature or getting fresh air.",
  applicationName: "Plots Minter",
  twitter: {
    card: "summary_large_image",
    site: "app.touchfreshgrass.com",
    creator: "Touch Grass",
    images: "https://app.touchfreshgrass.com/plots.jpg",
  },
  openGraph: {
    type: "website",
    url: "https://app.touchfreshgrass.com",
    title: "Plots Minter",
    description:
      "Plots are the way to disconnect from technology, and engage with the physical world, specifically by being in nature or getting fresh air.",
    siteName: "Plots Minter",
    images: [
      {
        url: "https://app.touchfreshgrass.com/plots.jpg",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "105vh",
            backgroundImage: "url(website_bg_collage.jpg)",
            backgroundSize: "cover",
            backgroundPositionX: "center",
            backgroundColor: "#000",
          }}
        >
          <Providers>
            <Navbar />
            <div style={{ flexGrow: 1 }}>{children}</div>
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  );
}
