import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import styles from "./minter.module.css";
import { useState } from "react";
import Image from "next/image";

import { formatEther, parseUnits } from "viem";

import nftJson from "../../artifacts/contracts/Plots.sol/Plots.json";
import tokenJson from "../../artifacts/contracts/TouchGrass.sol/TouchGrass.json";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;
const NETWORK_SCAN = process.env.NEXT_PUBLIC_NETWORK_SCAN;
const nftFee = 1000000;

export default function Minter() {
  const [nftAmount, setNFTAmount] = useState("1");
  const [transferAmount, setTransferAmount] = useState(parseUnits(`${nftFee}`, 18));
  const [approvedAmount, setApprovedAmount] = useState<bigint | null>(null);
  const [nftMinted, setNftMinted] = useState<boolean>(false);

  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [nftBalance, setNftBalance] = useState<number | null>(null);

  // get account address
  const { address, isConnecting, isDisconnected, isConnected } = useAccount();

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
      setNftMinted(true);
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

  function mintButton() {
    if (tokenBalance != null && tokenBalance < nftFee) {
      return (
        <button className={styles.button_inactive} disabled={true} onClick={() => {}}>
          Insufficient Balance
        </button>
      );
    } else if (nftBalance != null && nftBalance >= 2) {
      return (
        <button className={styles.button_inactive} disabled={true} onClick={() => {}}>
          Max. 3 NFTs/Wallet
        </button>
      );
    } else if ((approvedAmount != null && approvedAmount < transferAmount) || nftMinted) {
      return (
        <button
          className={styles.button}
          disabled={!approve || approvalLoading}
          onClick={() => {
            setNftMinted(false);
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
          onClick={() => mint?.()}
        >
          {isMintLoading ? "Minting..." : "MINT"}
        </button>
      );
    }
  }

  function successMessage() {
    if (approvalSuccess && !isMintSuccess && !isMintLoading) {
      return <div className={styles.message}>Now mint your NFTs!</div>;
    } else if (isMintSuccess && nftMinted) {
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
            width: "90%",
            height: "auto",
            margin: "1rem auto 3rem auto",
            borderRadius: "10px",
          }}
        />
        <div className={styles.nft_price}>
          <h3>Price: 1M $GRASS</h3>
        </div>
      </div>

      <div className={styles.account_info}>
        <h2>Account Info</h2>
        <div>{`Balance: ${tokenBalance} $GRASS`}</div>
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
