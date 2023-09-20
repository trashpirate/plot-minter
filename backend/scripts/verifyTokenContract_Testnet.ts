import * as hre from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/verifyTokenContract_Testnet.ts --network ETH_GOERLI

const constructorArguments = [process.env.OWNER_ADDRESS_TEST];
const contractAddress =  "0x24D810964c578a9d543618E59CE5b96dc82323D2";

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