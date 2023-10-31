import * as hre from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/mainnet/verifyNFTContract.ts --network MAINNET

const TOKEN_ADDRESS = "0xce611eCEc4D31a356f4e4c0967B51F3d861F79CB";
const BASE_URI = "ipfs://bafybeihvge2ojc42yhrkgljg7nr7svfcpdtgzehxazdt7gxgokcrys7fxy/";

const constructorArguments = [process.env.OWNER_ADDRESS_MAINNET, process.env.FEE_ADDRESS_MAINNET, TOKEN_ADDRESS, BASE_URI];
const contractAddress = "0x8C9eAD5e40EddC7F8EfA6ee3f1B9d40e37B8cABc";

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