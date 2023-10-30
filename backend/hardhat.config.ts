import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    hardhat: {
      accounts: {
        count: 70,
      }
    },
    MAINNET: {
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      url: `${process.env.RPC_ENDPOINT_URL_TESTNET}`,
    },
    TESTNET: {
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      url: `${process.env.RPC_ENDPOINT_URL_TESTNET}`,
    },    
  },
  gasReporter: {
    outputFile: "gas-report.txt",
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
    token: "ETH",
  },
  etherscan: {
      apiKey: `${process.env.SCAN_API_KEY}`,
    },
  paths: { tests: "tests", artifacts: "artifacts" },
};

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

export default config;
