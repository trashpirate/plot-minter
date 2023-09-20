import { ethers } from "ethers";
import { TouchGrass__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
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

  // deploy contract
  const owner = process.env.OWNER_ADDRESS as string;
  
  const contractFactory = new TouchGrass__factory(wallet);
  const contract = await contractFactory.deploy(owner);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`Token contract deployed at ${contractAddress}`);

  // wait for confirmations
  console.log(`Waiting for confirmations...`);
  const WAIT_BLOCK_CONFIRMATIONS = 2;
  const deploymentReceipt = await contract
    .deploymentTransaction()
    ?.wait(WAIT_BLOCK_CONFIRMATIONS);
  console.log(
    `Contract confirmed with ${WAIT_BLOCK_CONFIRMATIONS} confirmations.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
