"use client";
import Link from "next/link";
import Image from "next/image";
import {ConnectKitButton} from "connectkit";
import styles from "./navbar.module.css";
export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link className={styles.home_button} href="https://touchfreshgrass.com/" target={"_blank"}>
        <Image
          src="/logo.png"
          alt="GRASS logo"
          className={styles.button_img}
          width={50}
          height={50}
          priority
        />
        <p>Touch Grass</p>
      </Link>
      <Link className={styles.buy_button} href="https://pancakeswap.finance/swap?outputCurrency=0xce611eCEc4D31a356f4e4c0967B51F3d861F79CB" target={"_blank"}>
        <Image
          src="/pancakeswap.png"
          alt="pancakeswap logo"
          className={styles.button_img}
          width={50}
          height={50}
          priority
        />
        <p>BUY $GRASS</p>
      </Link>
      <div className={styles.connect_button}>
        <ConnectKitButton />
      </div>
    </nav>
  );
}
