"use client";

import { ConnectKitButton } from "connectkit";
import styles from "./navbar.module.css";
export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <a className={styles.home_button} href="https://touchfreshgrass.com/" target={"_blank"}>
        <p>Touch Grass</p>
      </a>
      <ConnectKitButton />
    </nav>
  );
}
