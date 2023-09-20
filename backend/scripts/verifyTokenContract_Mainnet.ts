import * as hre from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/verifyTokenContract_Mainnet.ts --network ETH_MAINNET

const constructorArguments = [process.env.OWNER_ADDRESS];
const contractAddress =  "0xbC68AE53d383f399Cc18268034C5E656fCb839f3";

async function main() {

  // verify contract
  console.log("Verifying contract on Etherscan...");
  if (constructorArguments != null) {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArguments,
      contract: "contracts/TouchGrass.sol:TouchGrass"
    });
  } else {
    await hre.run("verify:verify", {
      address: contractAddress,
      contract: "contracts/TouchGrass.sol:TouchGrass"
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});