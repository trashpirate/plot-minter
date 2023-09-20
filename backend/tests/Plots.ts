import { expect } from "chai";
import { ethers } from "hardhat";
import { Plots, TouchGrass } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { AddressLike } from "ethers";

let tokenAddress: AddressLike;
let nftContractAddress: AddressLike;
let deployer: HardhatEthersSigner;
let owner: HardhatEthersSigner;
let receiver: HardhatEthersSigner;
let account: HardhatEthersSigner;
let others: HardhatEthersSigner[];

const nftName = "Plots";
const nftSymbol = "PLOT";
const mintCost = ethers.parseUnits("1000000");

// function to deploy token contract
async function deployTokenContract() {
  const tokenFactory = await ethers.getContractFactory("TouchGrass");
  const tokenContract = await tokenFactory.deploy(owner.address);
  await tokenContract.waitForDeployment();
  tokenAddress = await tokenContract.getAddress();
  return tokenContract;
}

// function to deploy betting contract
async function deployBettingContract() {
  const contractFactory = await ethers.getContractFactory("Plots");
  const contract = await contractFactory.deploy(tokenAddress, receiver.address);
  await contract.waitForDeployment();
  nftContractAddress = await contract.getAddress();
  return contract;
}

describe("Tests for NFT contract", async () => {
  let nftContract: Plots;
  let tokenContract: TouchGrass;

  describe("when nft contract is deployed", async () => {
    beforeEach(async () => {
      [deployer, owner, receiver, account, ...others] =
        await ethers.getSigners();

      tokenContract = await deployTokenContract();
      await tokenContract.waitForDeployment();
      tokenAddress = await tokenContract.getAddress();

      nftContract = await deployBettingContract();
      await nftContract.waitForDeployment();
    });

    it("returns correct token address", async () => {
      const paymentToken = await nftContract.paymentToken();
      expect(paymentToken).to.eq(tokenAddress);
    });
    it("returns correct token name", async () => {
      const name = await nftContract.name();
      expect(name).to.eq(nftName);
    });
    it("returns correct token symbol", async () => {
      const symbol = await nftContract.symbol();
      expect(symbol).to.eq(nftSymbol);
    });
    it("returns correct nft rate", async () => {
      const nftRate = await nftContract.fee();
      expect(nftRate).to.eq(mintCost);
    });
    it("returns correct receiver", async () => {
      const receiverAddress = await nftContract.feeAddress();
      expect(receiverAddress).to.eq(receiver.address);
    });
    it("returns correct owner", async () => {
      const ownerAddress = await nftContract.owner();
      expect(ownerAddress).to.eq(deployer.address);
    });
  });

  describe("when owner interacts with contract", async () => {
    beforeEach(async () => {
      [deployer, owner, receiver, account] = await ethers.getSigners();

      tokenContract = await deployTokenContract();
      await tokenContract.waitForDeployment();
      tokenAddress = await tokenContract.getAddress();

      nftContract = await deployBettingContract();
      await nftContract.waitForDeployment();
    });

    it("owner can set new fee", async () => {
      const newFee = ethers.parseUnits("2000");
      await nftContract.setFee(newFee);
      const fee = await nftContract.fee();
      expect(fee).to.eq(newFee);
    });
    it("owner can set new fee address", async () => {
      await nftContract.setFeeAddress(owner.address);
      const feeAddress = await nftContract.feeAddress();
      expect(feeAddress).to.eq(owner.address);
    });
    it("owner can set new fee address", async () => {
      await nftContract.setFeeAddress(owner.address);
      const feeAddress = await nftContract.feeAddress();
      expect(feeAddress).to.eq(owner.address);
    });
  });

  describe("when user interacts with contract", async () => {
    beforeEach(async () => {
      [deployer, owner, receiver, account] = await ethers.getSigners();

      tokenContract = await deployTokenContract();
      await tokenContract.waitForDeployment();
      tokenAddress = await tokenContract.getAddress();

      nftContract = await deployBettingContract();
      await nftContract.waitForDeployment();

      const tx = await tokenContract
        .connect(owner)
        .transfer(account.address, ethers.parseUnits("5000000"));
      await tx.wait();

      for (let index = 0; index < others.length; index++) {
        const tx = await tokenContract
          .connect(owner)
          .transfer(others[index].address, ethers.parseUnits("3000000"));
        await tx.wait();
      }
    });

    it("mints single token to account", async () => {
      const nftRate = await nftContract.fee();
      await tokenContract.connect(account).approve(nftContractAddress, nftRate);
      const mintTx = await nftContract.connect(account).mint("1");
      await mintTx.wait();
      const balance = await nftContract
        .connect(account)
        .balanceOf(account.address);
      expect(balance).to.eq(1n);
    });

    it("mints multiple token to account", async () => {
      const quantity = 2n;
      const nftRate = await nftContract.fee();
      const paymentAmount = nftRate * quantity;
      await tokenContract
        .connect(account)
        .approve(nftContractAddress, paymentAmount);
      const mintTx = await nftContract
        .connect(account)
        .mint(quantity.toString());
      await mintTx.wait();
      const balance = await nftContract
        .connect(account)
        .balanceOf(account.address);
      expect(balance).to.eq(quantity);
    });

    it("charges correct amount", async () => {
      const quantity = 2n;
      const nftRate = await nftContract.fee();
      const paymentAmount = nftRate * quantity;
      await tokenContract
        .connect(account)
        .approve(nftContractAddress, paymentAmount);
      const mintTx = await nftContract
        .connect(account)
        .mint(quantity.toString());
      await mintTx.wait();
      const balance = await tokenContract.balanceOf(receiver.address);
      expect(balance).to.eq(paymentAmount);
    });

    it("reverts if exceeding maxBatchSize", async () => {
      const quantity = 4n;
      const nftRate = await nftContract.fee();
      const paymentAmount = nftRate * quantity;
      await tokenContract
        .connect(account)
        .approve(nftContractAddress, paymentAmount);

      await expect(nftContract.connect(account).mint(quantity.toString())).to.be
        .reverted;
    });

    it("reverts when maximum number of nfts exceeded", async () => {
      const quantity = 3n;
      const nftRate = await nftContract.fee();
      const paymentAmount = nftRate * quantity * 42n;
      
      for (let index = 0; index < 41; index++) {
        await tokenContract
        .connect(others[index])
        .approve(nftContractAddress, paymentAmount);

        const mintTx = await nftContract
          .connect(others[index])
          .mint(quantity.toString());
        await mintTx.wait();
      }
      await expect(nftContract.connect(others[41]).mint(quantity.toString())).to.be
        .reverted;
    });

    it("reverts when maximum per wallet exceeded", async () => {
      const quantity = 2n;
      const nftRate = await nftContract.fee();
      const paymentAmount = nftRate * quantity;
      await tokenContract
        .connect(account)
        .approve(nftContractAddress, paymentAmount);

      const mintTx = await nftContract
        .connect(account)
        .mint(quantity.toString());
      await mintTx.wait();

      await expect(nftContract.connect(account).mint(quantity.toString())).to.be
        .reverted;
    });

    it("reverts if setting fee", async () => {
      const newFee = ethers.parseUnits("2000");
      await expect(nftContract.connect(account).setFee(newFee)).to.be.reverted;
    });

    it("reverts if setting fee address", async () => {
      await expect(nftContract.connect(account).setFeeAddress(account.address))
        .to.be.reverted;
    });
  });
});
