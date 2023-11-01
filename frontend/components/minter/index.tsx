import {
  useAccount,
  useContractEvent,
  useContractRead,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import styles from "./minter.module.css";
import React, { useState } from "react";
import Image from "next/image";

import { formatEther, parseUnits } from "viem";

import { nftABI } from "../../assets/nftABI";
import { tokenABI } from "../../assets/tokenABI";
import { ConnectKitButton } from "connectkit";
import NFTInfo from "../nftInfo";
import dynamic from "next/dynamic";
const MediaQuery = dynamic(() => import("react-responsive"), {
  ssr: false,
});

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;
const NETWORK_SCAN = process.env.NEXT_PUBLIC_NETWORK_SCAN;

export default function Minter() {
  const [nftAmount, setNFTAmount] = useState("1");
  const [transferAmount, setTransferAmount] = useState<bigint | null>(null);
  const [approvedAmount, setApprovedAmount] = useState<bigint | null>(null);
  const [mintOpen, setMintOpen] = useState<boolean>(false);

  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [nftBalance, setNftBalance] = useState<number | null>(null);
  const [nftFee, setNftFee] = useState<number>(0);
  const [maxPerWallet, setMaxPerWallet] = useState<number>(2);

  // get account address
  const { address, isConnected } = useAccount({});

  // get chain
  const { chain } = useNetwork();

  // define token contract config
  const tokenContract = {
    address: TOKEN_CONTRACT,
    abi: tokenABI,
    chainId: chain?.id,
  };

  // define token contract config
  const nftContract = {
    address: NFT_CONTRACT,
    abi: nftABI,
    chainId: chain?.id,
  };

  // check balance
  const {} = useContractReads({
    contracts: [
      {
        ...tokenContract,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      },
      {
        ...tokenContract,
        functionName: "allowance",
        args: [address as `0x${string}`, NFT_CONTRACT],
      },
    ],
    enabled: isConnected && address != null,
    watch: true,
    onSuccess(data: any) {
      setTokenBalance(Number(formatEther(data[0].result)));
      setApprovedAmount(data[1].result as bigint);
    },
  });

  // check nft balance
  const {} = useContractReads({
    contracts: [
      {
        ...nftContract,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      },
      {
        ...nftContract,
        functionName: "fee",
      },
      {
        ...nftContract,
        functionName: "batchLimit",
      },
      {
        ...nftContract,
        functionName: "maxPerWallet",
      },
    ],
    enabled: isConnected && address != null,
    watch: true,
    onSuccess(data: any) {
      if (data != null) {
        setNftBalance(Number(data[0].result));
        setNftFee(Number(formatEther(data[1].result)));
        if (Number(data[2].result) > 0) setMintOpen(true);
        else setMintOpen(false);
        setTransferAmount(parseUnits(`${nftFee}`, 18));
        setMaxPerWallet(Number(data[3].result));
      }
    },
  });

  // approving funds
  const { config: approvalConfig } = usePrepareContractWrite({
    ...tokenContract,
    functionName: "approve",
    args: [NFT_CONTRACT, transferAmount as bigint],
    enabled: approvedAmount != null && transferAmount != null && approvedAmount < transferAmount,
  });
  const {
    data: approvedData,
    error: approvedError,
    isError: isApprovedError,
    write: approve,
  } = useContractWrite(approvalConfig);

  const { isLoading: approvalLoading, isSuccess: approvalSuccess } = useWaitForTransaction({
    confirmations: 1,
    hash: approvedData?.hash,
  });

  // mint nfts
  const { config: mintConfig } = usePrepareContractWrite({
    ...nftContract,
    functionName: "mint",
    args: [BigInt(nftAmount)],
    enabled:
      isConnected &&
      approvedAmount != null &&
      transferAmount != null &&
      nftBalance != null &&
      approvedAmount >= transferAmount &&
      Number(nftAmount) > 0 &&
      nftBalance + Number(nftAmount) <= maxPerWallet,
  });

  const {
    data: mintData,
    error: mintError,
    isError: isMintError,
    write: mint,
  } = useContractWrite(mintConfig);

  const { isLoading: isMintLoading, isSuccess: isMintSuccess } = useWaitForTransaction({
    confirmations: 1,
    hash: mintData?.hash,
  });

  // button for minting
  function mintButton() {
    if (!isConnected && mintOpen) {
      return (
        <div className={styles.connect}>
          <ConnectKitButton />
        </div>
      );
    } else if (tokenBalance != null && nftFee != null && tokenBalance < nftFee) {
      return (
        <button className={styles.button_inactive} disabled={true} onClick={(e) => {}}>
          Insufficient Balance
        </button>
      );
    } else if (nftBalance != null && nftBalance >= 2) {
      return (
        <button className={styles.button_inactive} disabled={true} onClick={(e) => {}}>
          Max. 2 NFTs/Wallet
        </button>
      );
    } else if (
      approvedAmount != null &&
      transferAmount != null &&
      approvedAmount >= transferAmount
    ) {
      return (
        <button
          className={styles.button_active}
          disabled={!mint || isMintLoading}
          onClick={(e) => {
            mint?.();
          }}
        >
          {isMintLoading ? "Minting..." : "MINT"}
        </button>
      );
    } else {
      return (
        <button
          className={styles.button}
          disabled={!approve || approvalLoading}
          onClick={(e) => {
            approve?.();
          }}
        >
          {approvalLoading ? "Approving..." : "MINT"}
        </button>
      );
    }
  }

  // message after interaction
  function successMessage() {
    if (approvedAmount != null && transferAmount != null && approvedAmount >= transferAmount) {
      return <div className={styles.message}>Now mint your NFTs!</div>;
    } else if (isMintSuccess) {
      return (
        <div className={styles.message}>
          Successfully Minted!
          <a target={"_blank"} href={`${NETWORK_SCAN}/${mintData?.hash}`}>
            <div>
              <p>View on Bscscan</p>
            </div>
          </a>
        </div>
      );
    } else {
      return <div className={styles.message}></div>;
    }
  }

  // display image
  function setImageSrc() {
    if (isMintLoading) {
      return "/nftAnimation.gif";
    } else if (isMintSuccess) {
      return "/featured_image.jpg";
    } else {
      return "/logo.png";
    }
  }

  // render component
  return (
    <div className={styles.container}>
      <div className={styles.nft_card}>
        <Image
          src={setImageSrc()}
          width={300}
          height={300}
          alt="Plot NFTs"
          style={{
            width: "100%",
            height: "auto",
            margin: "0 auto auto auto",
            borderRadius: "10px",
          }}
        />
        <div className={styles.nft_price}>
          <h3>Price: 2M $GRASS</h3>
        </div>
      </div>
      <div className={styles.mint_info}>
        <MediaQuery minDeviceWidth={1000}>{<NFTInfo></NFTInfo>}</MediaQuery>

        {mintOpen && (
          <div className={styles.account_info}>
            <h2>Account Info</h2>
            <div className={styles.horizontal_line}></div>
            <div className={styles.account_balances}>
              <div className={styles.balance}>
                <div>{`Balance:`}</div>
                <div style={{ textAlign: "right" }}>{`${
                  tokenBalance != null ? tokenBalance.toFixed(0) : "0"
                } $GRASS`}</div>
              </div>
              <div className={styles.balance}>
                <div>{`NFTs minted:`}</div>
                <div style={{ textAlign: "right" }}>{`${nftBalance != null ? nftBalance : 0}`}</div>
              </div>
            </div>
          </div>
        )}

        {mintOpen && isConnected && (
          <div className={styles.container_mint}>
            <form className={styles.form}>
              <label>
                Enter number of NFTs:
                <input
                  type="number"
                  value={nftAmount}
                  max="2"
                  min="1"
                  placeholder="1"
                  onChange={(e) => {
                    setNFTAmount(e.target.value);
                    setTransferAmount(parseUnits(`${Number(e.target.value) * nftFee}`, 18));
                  }}
                />
              </label>
            </form>
            {mintButton()}
            {successMessage()}
          </div>
        )}
        {mintOpen && !isConnected && (
          <div className={styles.container_mint}>
            <h2 style={{ marginTop: "50px" }}>MINT IS LIVE!</h2>
          </div>
        )}
        {!mintOpen && (
          <div className={styles.container_mint}>
            <h2 style={{ marginTop: "50px", marginBottom: "50px" }}>Plots NFT Collection Mint</h2>
            <h3>NOVEMBER 1 | 1PM CST</h3>
          </div>
        )}
      </div>
    </div>
  );
}
