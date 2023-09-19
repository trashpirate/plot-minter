import { ethers } from "ethers";
import * as hre from "hardhat";
import { MyToken, MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/verifyTokenContract.ts --network ETH_GOERLI

const constructorArguments = ["0xCbA52038BF0814bC586deE7C061D6cb8B203f8e1"];
const contractAddress =  "0x5cA6D70e6D92B2BF5E7a488BCAC4378f92F09192";

async function main() {
    // define provider
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );

  // define wallet
  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEYS?.split(",")[0] ?? "",
    provider
  );

  // wallet info
  console.log(`Using address ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  // get contract
  const contractFactory = new MyToken__factory(wallet);
  const contract = (await contractFactory.attach(contractAddress)) as MyToken;

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