import { ethers } from "ethers";
import * as hre from "hardhat";
import { Plots, Plots__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/verifyNFTContract_Mainnet.ts --network ETH_MAINNET

const constructorArguments = ["0xbc68ae53d383f399cc18268034c5e656fcb839f3", process.env.OWNER_ADDRESS];
const contractAddress =  "0xBfC7496D7B8805e475e191062D6E5897879579a3";

async function main() {
  
  // verify contract
  console.log("Verifying contract on Etherscan...");
  if (constructorArguments != null) {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArguments,
    });
  } else {
    await hre.run("verify:verify", {
      address: contractAddress,
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});