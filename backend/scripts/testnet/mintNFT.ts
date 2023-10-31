import {ethers} from "ethers";
import {Plots, Plots__factory, TouchGrass, TouchGrass__factory} from "../../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {

  const nftContractAddress = "0xFF49cE063f27d64536d91D7CEb3552eA759BbFe5";
  const tokenContractAddress = "0x9A5c3ad69A6A2EC704AfcD01411b46561467d556";

  // define provider and deployer
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL_TESTNET ?? ""
  );

  const ownerWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY ?? "",
    provider
  );
  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEYS?.split(",")[2] ?? "",
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

  // get token contract
  const tokenFactory = new TouchGrass__factory(ownerWallet);
  const tokenContract = await tokenFactory.attach(tokenContractAddress) as TouchGrass;
  const tokenAddress = await tokenContract.getAddress();
  console.log(`Token contract deployed at ${ tokenAddress }`);


  // approve tokens
  const approveTx = await tokenContract.connect(wallet).approve(contractAddress, ethers.parseUnits("4000000"));
  await approveTx.wait();

  // mint single nft
  const mintTx = await nftContract.connect(wallet).mint(1n);
  const receipt = await mintTx.wait();
  console.log(receipt?.hash);

  // // mint multiple nft
  // const mintTx2 = await nftContract.connect(wallet).mint(2n);
  // const receipt2 = await mintTx2.wait();
  // console.log(receipt2?.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
