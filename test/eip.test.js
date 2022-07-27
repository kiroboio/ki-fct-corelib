const { artifacts, web3, ethers } = require("hardhat");
const { BatchMultiSigCall, utils } = require("../dist/index.js");
const assert = require("assert");
//const ABI = require("../src/abi/factoryProxy_.abi.json");
const { expect } = require("chai");
const { Flow } = require("../dist/constants.js");
const { TypedDataUtils } = require("ethers-eip712");
const { defaultAbiCoder } = require("ethers/lib/utils.js");

// All the contracts are imported from ki-eth-contracts repository.
// To make the Hardhat work with contracts from ki-eth-contracts, contracts folder
// contains all the necessary contracts, which just imports the dependency contracts.
const WalletCore = artifacts.require("../contracts/RecoveryWalletCore");
const RecoveryWallet = artifacts.require("../contracts/RecoveryWallet");
const Oracle = artifacts.require("../contracts/RecoveryOracle");
const Activator = artifacts.require("../contracts/economy/Activator");
const Factory = artifacts.require("../contracts/Factory");
const FactoryProxy = artifacts.require("../contracts/FactoryProxy");
const FactoryProxy_ = artifacts.require("../contracts/FactoryProxy_");
const ERC20Token = artifacts.require("ERC20Token");
const Validator = artifacts.require("../contracts/Validator");
const ERC721 = artifacts.require("ERC721Token");
const UniSwapPair = artifacts.require("UniSwapPair");
const Activators = artifacts.require("Activators");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("FactoryProxy contract library", function () {
  describe("Inital for factoryProxy", function () {
    it("Util", () => {
      const types = ["uint256", "string"];
      const values = ["20", "hello world hehe web3"];
      const data = utils.getEncodedData(types, values);
      console.log(ethers.utils.formatBytes32String("hello world hehe web3"));

      console.log(
        ethers.utils.hexlify(
          ethers.utils.arrayify(
            ethers.utils.hexZeroPad(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("hello world hehe web3")), 32)
          )
        )
      );

      console.log(data);
    });
    it("Params ERC20 Transfer", async () => {
      const accounts = await web3.eth.getAccounts();

      const types = ["address", "uint256"];
      const values = [accounts[12], "20"];

      const data = utils.getEncodedData(types, values);

      console.log(data);
    });
  });
});
