"use client";
import Link from "next/link";
import Image from "next/image";
import { ConnectKitButton } from "connectkit";
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
      <Link className={styles.buy_button} href="https://diamondswap.org/" target={"_blank"}>
        <Image
          src="/diamondswap.svg"
          alt="diamondswap logo"
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
