'use client'
import InstructionsComponent from "@/components/instructionsComponent";
import styles from "./page.module.css";
import "./globals.css";
import Minter from "@/components/minter";

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header_container}>
        <div className={styles.header}>
          <h1>
            nft-minting<span>-dapp</span>
          </h1>
          <h3>A website to mint nfts</h3>
        </div>
      </header>
      <div>
        <Minter></Minter>
      </div>
    </main>
  );
}
