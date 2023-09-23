"use client";

import { ConnectKitButton } from "connectkit";
import styles from "./navbar.module.css";
export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <a className={styles.home_button} href="https://touchfreshgrass.com/" target={"_blank"}>
        <p>Touch Grass</p>
      </a>
      <a
        className={styles.buy_button}
        href="https://app.uniswap.org/swap?outputCurrency=0xbc68ae53d383f399cc18268034c5e656fcb839f3"
        target={"_blank"}
      >
        <p>BUY $GRASS</p>
      </a>
      <ConnectKitButton />
    </nav>
  );
}
