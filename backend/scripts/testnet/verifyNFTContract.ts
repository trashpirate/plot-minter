import * as hre from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/testnet/verifyNFTContract.ts --network TESTNET

const TOKEN_ADDRESS = "0x9A5c3ad69A6A2EC704AfcD01411b46561467d556";
const BASE_URI = "ipfs://bafybeihvge2ojc42yhrkgljg7nr7svfcpdtgzehxazdt7gxgokcrys7fxy/";

const constructorArguments = [process.env.OWNER_ADDRESS_TESTNET, process.env.FEE_ADDRESS_TESTNET, TOKEN_ADDRESS, BASE_URI];
const contractAddress = "0xFF49cE063f27d64536d91D7CEb3552eA759BbFe5";

async function main() {
  
  // verify contract
  console.log("Verifying contract on Etherscan...");
  if (constructorArguments != null) {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArguments,
      contract: "contracts/Plots.sol:Plots"
    });
  } else {
    await hre.run("verify:verify", {
      address: contractAddress,
      contract: "contracts/Plots.sol:Plots"
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});