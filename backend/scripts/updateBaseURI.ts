import { ethers } from "ethers";
import { TouchGrass, TouchGrass__factory, Plots, Plots__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();



async function main() {

const nftContractAddress = "0xB3c01d7FcAFc5bc548B74ad5b17091748e38056A";
const newURI = "ipfs://bafybeigon7gjeqcw2ghjwkfyrw7yuzyunkca2dbjzscxzxaoc5tsiti7ke/";

  // define provider and deployer
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  
  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEYS?.split(",")[0] ?? "",
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

  // get nft contract
  const contractFactory = new NFT__factory(wallet);
  const nftContract = await contractFactory.attach(nftContractAddress) as NFT;
  const contractAddress = await nftContract.getAddress();
  console.log(`NFT contract deployed at ${contractAddress}`);

  // update uri
  const updateTx = await nftContract.setBaseURI(newURI);
  await updateTx.wait()

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
