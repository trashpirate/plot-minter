'use client'
import Image from "next/image";
import styles from "./page.module.css";
import "./globals.css";
import Minter from "@/components/minter";
import NFTInfo from "@/components/nftInfo";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header_container}>
          <div className={styles.header}>
            <h1>Mint Your Plots!</h1>
            <h3>
              Plots are the way to disconnect from technology, and engage with the physical world,
              specifically by being in nature or getting fresh air.
            </h3>
          </div>
        </header>
        <div>
          <NFTInfo></NFTInfo>
          <Minter></Minter>
        </div>
      </div>
    </main>
  );
}
