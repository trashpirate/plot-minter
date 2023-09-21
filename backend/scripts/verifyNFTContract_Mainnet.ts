import * as hre from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/verifyNFTContract_Mainnet.ts --network ETH_MAINNET

const constructorArguments = ["0xbc68ae53d383f399cc18268034c5e656fcb839f3", process.env.FEE_ADDRESS];
const contractAddress =  "0x8C9eAD5e40EddC7F8EfA6ee3f1B9d40e37B8cABc";

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