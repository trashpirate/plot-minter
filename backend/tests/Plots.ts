import { expect } from "chai";
import { ethers } from "hardhat";
import { Plots, Token__factory, TouchGrass } from "../typechain-types";
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
const mintCost = ethers.parseUnits("2000000");
const baseUri =
  "ipfs://bafybeihvge2ojc42yhrkgljg7nr7svfcpdtgzehxazdt7gxgokcrys7fxy/";

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
  const contract = await contractFactory.deploy(owner.address, tokenAddress, receiver.address, baseUri);
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
      expect(ownerAddress).to.eq(owner.address);
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
      await nftContract.connect(owner).setFee(newFee);
      const fee = await nftContract.fee();
      expect(fee).to.eq(newFee);
    });
    it("owner can set new fee address", async () => {
      await nftContract.connect(owner).setFeeAddress(owner.address);
      const feeAddress = await nftContract.feeAddress();
      expect(feeAddress).to.eq(owner.address);
    });
    it("owner can set new fee address", async () => {
      await nftContract.connect(owner).setFeeAddress(owner.address);
      const feeAddress = await nftContract.feeAddress();
      expect(feeAddress).to.eq(owner.address);
    });
    it("owner can withdraw GRASS tokens from contract", async () => {
      const sentTokenAmount = ethers.parseUnits("200000");
      const fundtx = await tokenContract
        .connect(owner)
        .transfer(account.address, ethers.parseUnits("5000000"));
      await fundtx.wait();
      const tx = await tokenContract
        .connect(account)
        .transfer(nftContractAddress, sentTokenAmount);
      await tx.wait();
      let contractBalance = await tokenContract.balanceOf(nftContractAddress);
      expect(contractBalance).to.eq(sentTokenAmount);

      const withdrawTx = await nftContract.connect(owner).withdrawTokens(tokenAddress, account.address);
      await withdrawTx.wait();
      contractBalance = await tokenContract.balanceOf(nftContractAddress);
      expect(contractBalance).to.eq(0n);
    });
    
    it("owner can withdraw ANY tokens from contract", async () => {
      const anyTokenFactory = new Token__factory(deployer);
      const anyToken = await anyTokenFactory.deploy(deployer);
      await anyToken.waitForDeployment();
      const anyTokenAddress = await anyToken.getAddress();

      const sentTokenAmount = ethers.parseUnits("200000");
      const fundtx = await anyToken
        .connect(deployer)
        .transfer(account.address, ethers.parseUnits("5000000"));
      await fundtx.wait();
      const tx = await anyToken
        .connect(account)
        .transfer(nftContractAddress, sentTokenAmount);
      await tx.wait();
      let contractBalance = await anyToken.balanceOf(nftContractAddress);
      expect(contractBalance).to.eq(sentTokenAmount);

      const withdrawTx = await nftContract.connect(owner).withdrawTokens(anyTokenAddress, account.address);
      await withdrawTx.wait();
      contractBalance = await anyToken.balanceOf(nftContractAddress);
      expect(contractBalance).to.eq(0n);
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
          .transfer(others[index].address, ethers.parseUnits("5000000"));
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
      const quantity = 2n;
      const nftRate = await nftContract.fee();
      const paymentAmount = nftRate * quantity * 62n;
      
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
