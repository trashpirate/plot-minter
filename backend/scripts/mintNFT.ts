import { ethers } from "ethers";
import { MyToken, MyToken__factory, NFT, NFT__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();



async function main() {

const tokenContractAddress = "0x5cA6D70e6D92B2BF5E7a488BCAC4378f92F09192";
const nftContractAddress = "0x44587537E0576913ef4393f9a8f857dbD36Bc4bA";

  // define provider and deployer
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  
  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEYS?.split(",")[0] ?? "",
    provider
  );

  const user = new ethers.Wallet(
    process.env.PRIVATE_KEYS?.split(",")[3] ?? "",
    provider
  );

  // get wallet information
  console.log(`Using address ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  // get token contract
  const tokenFactory = new MyToken__factory(wallet);
  const tokenContract = await tokenFactory.attach(tokenContractAddress) as MyToken;
  const tokenAddress = await tokenContract.getAddress();
  console.log(`Token contract deployed at ${tokenAddress}`);

  // get nft contract
  const contractFactory = new NFT__factory(wallet);
  const nftContract = await contractFactory.attach(nftContractAddress) as NFT;
  const contractAddress = await nftContract.getAddress();
  console.log(`NFT contract deployed at ${contractAddress}`);

  // approve funds
  const fee = await nftContract.fee();
  const approveTx = await tokenContract.connect(user).approve(nftContractAddress,fee);
  await approveTx.wait();

  // mint nft
  const mintTx = await nftContract.connect(user).mint(1n);
  await mintTx.wait()

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
