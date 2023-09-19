import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import styles from "./minter.module.css";
import { useEffect, useState } from "react";

// import { abi } from "../../artifacts/contracts/NFT.sol/NFT.json";
// import { abi as tokenABI } from "../../artifacts/contracts/Token.sol/MyToken.json";
import { nftABI } from "@/assets/nftABI";
import { formatEther, isAddress, parseUnits } from "viem";
import { tokenABI } from "@/assets/tokenABI";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;
const NETWORK_SCAN = process.env.NEXT_PUBLIC_NETWORK_SCAN;
const nftFee = 1000000;

export default function Minter() {
  const [nftAmount, setNFTAmount] = useState("1");
  const [transferAmount, setTransferAmount] = useState(parseUnits(`${nftFee}`, 18));
  const [approvedAmount, setApprovedAmount] = useState(parseUnits("0", 18));

  // check alloance
  const { address, isConnecting, isDisconnected, isConnected } = useAccount();
  const {
    data: allowanceData,
    isError: allowanceError,
    isLoading: allowanceLoading,
  } = useContractRead({
    address: TOKEN_CONTRACT,
    abi: tokenABI,
    functionName: "allowance",
    args: [address as `0x${string}`, NFT_CONTRACT],
    enabled: address != null,
    watch: true,
    onSuccess(data) {
      setApprovedAmount(data);
    },
  });

  // approving funds
  const { config: approvalConfig } = usePrepareContractWrite({
    address: TOKEN_CONTRACT as `0x${string}`,
    abi: tokenABI,
    functionName: "approve",
    args: [NFT_CONTRACT, transferAmount],
    enabled: approvedAmount < transferAmount,
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
    abi: nftABI,
    functionName: "mint",
    args: [BigInt(nftAmount)],
    enabled: approvedAmount >= transferAmount,
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

  function buttonText() {
    if (approvalLoading) {
      return "Approving...";
    } else if (isMintLoading) {
      return "Minting...";
    } else {
      return "MINT";
    }
  }

  function successMessage() {
    if (approvalSuccess) {
      return <div className={styles.message}>Now mint your NFTs!</div>;
    } else if (isMintSuccess) {
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
      return <div></div>;
    }
  }

  // render component
  return (
    <div className={styles.container}>
      <form className={styles.form}>
        <label>
          Enter number of NFTs:
          <input
            type="number"
            value={nftAmount}
            max="5"
            min="1"
            placeholder="1"
            onChange={(e) => {
              setNFTAmount(e.target.value);
              setTransferAmount(parseUnits(`${Number(e.target.value) * nftFee}`, 18));
            }}
          />
        </label>
      </form>
      <button
        className={styles.button}
        disabled={!approve || approvalLoading}
        onClick={() => {
          approvedAmount < transferAmount ? approve?.() : mint?.();
        }}
      >
        {buttonText()}
      </button>
      {successMessage()}
      {(isApprovedError || isMintError) && (
        <div className={styles.error_message}>Transaction aborted.</div>
      )}
    </div>
  );
}
