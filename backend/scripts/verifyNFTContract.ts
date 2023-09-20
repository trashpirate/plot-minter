import { ethers } from "ethers";
import * as hre from "hardhat";
import { Plots, Plots__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/verifyNFTContract.ts --network ETH_GOERLI

const constructorArguments = ["0x24D810964c578a9d543618E59CE5b96dc82323D2", process.env.OWNER_ADDRESS_TEST];
const contractAddress =  "0xB3c01d7FcAFc5bc548B74ad5b17091748e38056A";

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