import {ethers} from "ethers";
import {Plots, Plots__factory, TouchGrass, TouchGrass__factory} from "../../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {

  const nftContractAddress = "0x8C9eAD5e40EddC7F8EfA6ee3f1B9d40e37B8cABc";
  const tokenContractAddress = "0xce611eCEc4D31a356f4e4c0967B51F3d861F79CB";

  // define provider and deployer
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL_MAINNET ?? ""
  );

  const ownerWallet = new ethers.Wallet(
    process.env.DEPLOYER_PRIVATE_KEY ?? "",
    provider
  );
  const wallet = new ethers.Wallet(
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
