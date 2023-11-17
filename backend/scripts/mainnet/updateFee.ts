import { ethers } from "ethers";
import * as dotenv from "dotenv";
import {Plots, Plots__factory} from "../../typechain-types";
dotenv.config();



async function main() {

  const nftContractAddress = "0x8C9eAD5e40EddC7F8EfA6ee3f1B9d40e37B8cABc";

  // define provider and deployer
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL_MAINNET ?? ""
  );
  
  const wallet = new ethers.Wallet(
    process.env.DEPLOYER_PRIVATE_KEY ?? "",
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
  const contractFactory = new Plots__factory(wallet);
  const nftContract = await contractFactory.attach(nftContractAddress) as Plots;
  const contractAddress = await nftContract.getAddress();
  console.log(`NFT contract deployed at ${contractAddress}`);

  // update fee
  const updateTx = await nftContract.setFee(newFee);
  const receipt = await updateTx.wait()
  console.log(receipt)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
