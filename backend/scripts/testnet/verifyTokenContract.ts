import * as hre from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/testnet/verifyTokenContract.ts --network TESTNET

const constructorArguments = [process.env.OWNER_ADDRESS_TESTNET];
const contractAddress =  "0x9A5c3ad69A6A2EC704AfcD01411b46561467d556";

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