import {
  useAccount,
  useContractEvent,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import styles from "./minter.module.css";
import React, { useState } from "react";
import Image from "next/image";

import { formatEther, parseUnits } from "viem";

import nftJson from "../../artifacts/contracts/Plots.sol/Plots.json";
import tokenJson from "../../artifacts/contracts/TouchGrass.sol/TouchGrass.json";
import { ConnectKitButton } from "connectkit";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;
const NETWORK_SCAN = process.env.NEXT_PUBLIC_NETWORK_SCAN;
const nftFee = 1000000;

export default function Minter() {
  const [nftAmount, setNFTAmount] = useState("1");
  const [transferAmount, setTransferAmount] = useState(parseUnits(`${nftFee}`, 18));
  const [approvedAmount, setApprovedAmount] = useState<bigint | null>(null);
  const [mintStarted, setMintStarted] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [tokenID, setTokenID] = useState<number | null>(null);

  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [nftBalance, setNftBalance] = useState<number | null>(null);

  // get account address
  const { address, isConnecting, isDisconnected, isConnected } = useAccount({
    onConnect({ address, connector, isReconnected }) {
      setConnected(true);
      setMintStarted(false);
    },
    onDisconnect() {
      setConnected(false);
    },
  });

  // check balance
  const {
    data: tokenBalanceData,
    isError: tokenBalanceError,
    isLoading: tokenBalanceLoading,
    isSuccess: tokenBalanceSuccess,
  } = useContractRead({
    address: TOKEN_CONTRACT,
    abi: tokenJson.abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    enabled: address != null,
    watch: true,
    onSuccess(data: bigint) {
      setTokenBalance(Number(formatEther(data)));
    },
  });

  // check nft balance
  const {
    data: nftBalanceData,
    isError: nftBalanceError,
    isLoading: nftBalanceLoading,
    isSuccess: nftBalanceSuccess,
  } = useContractRead({
    address: NFT_CONTRACT,
    abi: tokenJson.abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    enabled: address != null,
    watch: true,
    onSuccess(data) {
      setNftBalance(Number(data));
    },
  });

  // check allowance
  const {
    data: allowanceData,
    isError: allowanceError,
    isLoading: allowanceLoading,
    isSuccess: allowanceSuccess,
  } = useContractRead({
    address: TOKEN_CONTRACT,
    abi: tokenJson.abi,
    functionName: "allowance",
    args: [address as `0x${string}`, NFT_CONTRACT],
    enabled: address != null,
    watch: true,
    onSuccess(data) {
      setApprovedAmount(data as bigint);
    },
  });

  // approving funds
  const { config: approvalConfig } = usePrepareContractWrite({
    address: TOKEN_CONTRACT as `0x${string}`,
    abi: tokenJson.abi,
    functionName: "approve",
    args: [NFT_CONTRACT, transferAmount],
    enabled: approvedAmount != null && approvedAmount < transferAmount,
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
    address: NFT_CONTRACT as `0x${string}`,
    abi: nftJson.abi,
    functionName: "mint",
    args: [BigInt(nftAmount)],
    enabled: approvedAmount != null && approvedAmount >= transferAmount,
    onSuccess(data) {
      console.log(data);
    },
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

  // watch for minting event
  const unwatch = useContractEvent({
    address: NFT_CONTRACT as `0x${string}`,
    abi: nftJson.abi,
    eventName: "Mint",
    listener(log: any) {
      // console.log(log);
      // console.log(log[0].topics[2]);
      // console.log(address);
      // console.log(parseInt(log[0].topics[3], 16));
      if (log[0].topics[2] === address) {
        // console.log(parseInt(log[0].topics[3], 16));
        setTokenID(parseInt(log[0].topics[3], 16));
        // unwatch?.();
      }
    },
  });

  // button for minting
  function mintButton() {
    if (!connected) {
      return (
        <div className={styles.connect}>
          <ConnectKitButton />
        </div>
      );
    } else if (tokenBalance != null && tokenBalance < nftFee) {
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
    } else if (approvedAmount != null && approvedAmount < transferAmount) {
      return (
        <button
          className={styles.button}
          disabled={!approve || approvalLoading}
          onClick={(e) => {
            setMintStarted(true);
            approve?.();
          }}
        >
          {approvalLoading ? "Approving..." : "MINT"}
        </button>
      );
    } else if (approvedAmount != null && approvedAmount >= transferAmount) {
      return (
        <button
          className={styles.button_active}
          disabled={!mint || isMintLoading}
          onClick={(e) => {
            setMintStarted(true);
            mint?.();
            setMintStarted(false);
          }}
        >
          {isMintLoading ? "Minting..." : "MINT"}
        </button>
      );
    }
  }

  // message after interaction
  function successMessage() {
    if (approvedAmount != null && approvedAmount >= transferAmount) {
      return <div className={styles.message}>Now mint your NFTs!</div>;
    } else if (isMintSuccess && !mintStarted) {
      return (
        <div className={styles.message}>
          Successfully Minted!
          <a target={"_blank"} href={`${NETWORK_SCAN}/${mintData?.hash}`}>
            <div>
              <p>View on Etherscan</p>
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
      return tokenID != null ? `/nfts/${tokenID}.png` : "/featured_image.jpg";
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
            margin: "0 auto 3rem auto",
            borderRadius: "10px",
          }}
        />
        <div className={styles.nft_price}>
          <h3>Price: 1M $GRASS</h3>
        </div>
      </div>

      <div className={styles.account_info}>
        <h2>Account Info</h2>
        <div>{`Balance: ${tokenBalance ? tokenBalance.toFixed(0) : "0"} $GRASS`}</div>
        <div>{`NFTs minted: ${nftBalance}`}</div>
      </div>

      <div className={styles.container_mint}>
        <form className={styles.form}>
          <label>
            Enter number of NFTs:
            <input
              type="number"
              value={nftAmount}
              max="3"
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
    </div>
  );
}
function listReactFiles(__dirname: string) {
  throw new Error("Function not implemented.");
}

