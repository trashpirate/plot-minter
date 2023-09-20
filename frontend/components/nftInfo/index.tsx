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

import nftJson from "../../artifacts/contracts/Plots.sol/Plots.json";
import tokenJson from "../../artifacts/contracts/TouchGrass.sol/TouchGrass.json";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;
const NETWORK_SCAN = process.env.NEXT_PUBLIC_NETWORK_SCAN;
const nftFee = 1000000;

export default function NFTInfo() {
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [remainingSupply, setRemainingSupply] = useState<number | null>(null);

  // check allowance
  const {
    data: totalSupplyData,
    isError: totalSupplyError,
    isLoading: totalSupplyLoading,
    isSuccess: totalSupplySuccess,
  } = useContractRead({
    address: NFT_CONTRACT,
    abi: nftJson.abi,
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
      <p>{NFT_CONTRACT}</p>
      {/* <Image
        src="/logo.png"
        width={150}
        height={150}
        alt="Plot NFTs"
        style={{ margin: "20px auto", borderRadius: "10px" }}
      /> */}
      <div className={styles.container_info}>
        <div>{`Total NFTs minted: ${totalSupply}`}</div>
        <div>{`Remaining NFTs to mint: ${remainingSupply}`}</div>
      </div>
      <a href="https://opensea.io/collection/plots-4" className={styles.button}>
        View on OpenSea
      </a>
    </div>
  );
}
