import { ethers } from "ethers";
import * as hre from "hardhat";
import { NFT, NFT__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/verifyNFTContract.ts --network ETH_GOERLI

const constructorArguments = ["0x5cA6D70e6D92B2BF5E7a488BCAC4378f92F09192", "0x629976398c65fC2ccf21D86b53D09299A3447d02"];
const contractAddress =  "0x44587537E0576913ef4393f9a8f857dbD36Bc4bA";

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
  const contractFactory = new NFT__factory(wallet);
  const contract = (await contractFactory.attach(contractAddress)) as NFT;

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