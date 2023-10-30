import { ethers } from "ethers";
import { Plots__factory } from "../../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const TOKEN_ADDRESS = "0x9A5c3ad69A6A2EC704AfcD01411b46561467d556";
const BASE_URI =
  "ipfs://bafybeihvge2ojc42yhrkgljg7nr7svfcpdtgzehxazdt7gxgokcrys7fxy/";

async function main() {
  // define provider and deployer
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL_TESTNET ?? ""
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
  const owner = process.env.OWNER_ADDRESS_TESTNET as string;
  const receiver = process.env.FEE_ADDRESS_TESTNET as string;
  const tokenAdress = TOKEN_ADDRESS;

  const contractFactory = new Plots__factory(wallet);
  const contract = await contractFactory.deploy(
    owner,
    receiver,
    tokenAdress,
    BASE_URI
  );
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
