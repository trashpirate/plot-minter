import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import styles from "./nftInfo.module.css";
import { useState } from "react";
// import { CopyToClipboard } from "react-copy-to-clipboard";
import Image from "next/image";

import { nftABI } from "../../assets/nftABI";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;

export default function NFTInfo() {
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [remainingSupply, setRemainingSupply] = useState<number | null>(null);

  // check allowance
  const {} = useContractRead({
    address: NFT_CONTRACT,
    abi: nftABI,
    functionName: "totalSupply",
    watch: true,
    onSuccess(data) {
      setTotalSupply(Number(data));
      setRemainingSupply(125 - Number(data));
    },
  });

  // render component
  return (
    <div className={styles.container}>
      <div className={styles.container_info}>
        <div>{`Total NFTs minted: ${totalSupply}`}</div>
        <div>{`Remaining NFTs to mint: ${remainingSupply}`}</div>
      </div>
      <a href="https://opensea.io/collection/tgplots" className={styles.button}>
        View on OpenSea
      </a>
    </div>
  );
}
