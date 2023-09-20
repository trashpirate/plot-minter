import { ethers } from "ethers";
import { Plots__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const tokenContractAddress = "0x24D810964c578a9d543618E59CE5b96dc82323D2";
const feeAddress = process.env.OWNER_ADDRESS_TEST as string;

async function main() {
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

  // deploy contract
  const contractFactory = new Plots__factory(wallet);
  const contract = await contractFactory.deploy(tokenContractAddress, feeAddress);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`NFT contract deployed at ${contractAddress}`);

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
