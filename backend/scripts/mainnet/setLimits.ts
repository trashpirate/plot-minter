import {ethers} from "ethers";
import {Plots, Plots__factory} from "../../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();



async function main() {

  const nftContractAddress = "0x8C9eAD5e40EddC7F8EfA6ee3f1B9d40e37B8cABc";

  // define provider and deployer
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL_MAINNET ?? ""
  );

  const ownerWallet = new ethers.Wallet(
    process.env.DEPLOYER_PRIVATE_KEY ?? "",
    provider
  );

  // get wallet information
  console.log(`Using address ${ ownerWallet.address }`);
  const balanceBN = await provider.getBalance(ownerWallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${ balance }`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  // get nft contract
  const contractFactory = new Plots__factory(ownerWallet);
  const nftContract = await contractFactory.attach(nftContractAddress) as Plots;
  const contractAddress = await nftContract.getAddress();
  console.log(`NFT contract deployed at ${ contractAddress }`);

  // set batch limit
  const setTx2 = await nftContract.connect(ownerWallet).setMaxPerWallet(10n);
  await setTx2.wait();
  const setTx = await nftContract.connect(ownerWallet).setBatchLimit(10n);
  await setTx.wait();
  
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
