const { artifacts, web3 } = require("hardhat");
const { BatchMultiSigCall } = require("../dist/index.js");
const assert = require("assert");
const { expect } = require("chai");
const { Flow } = require("../dist/constants.js");

// All the contracts are imported from ki-eth-contracts repository.
// To make the Hardhat work with contracts from ki-eth-contracts, contracts folder
// contains all the necessary contracts, which just imports the dependency contracts.
const MultiSigWallet = artifacts.require("MultiSigWallet");
const WalletCore = artifacts.require("RecoveryWalletCore");
const Wallet = artifacts.require("RecoveryWallet");
const Oracle = artifacts.require("RecoveryOracle");
const Activator = artifacts.require("Activator");
const Factory = artifacts.require("Factory");
const FactoryProxy = artifacts.require("FactoryProxy");
const FactoryProxy_ = artifacts.require("FactoryProxy_");
const ERC20Token = artifacts.require("ERC20Token");
const Validator = artifacts.require("Validator");
const ERC721 = artifacts.require("ERC721Token");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("BatchMultiSigCall", () => {
   describe("BatchMultiSigCall function", function () {
    let batchMultiSigCall;
    it("Should add batchMulticall", async () => {
      batchMultiSigCall = new BatchMultiSigCall(web3, factoryProxy.address);

      const signer1 = getSigner(10);
      const signer2 = getSigner(11);

      // Minting NFT for signer2 to check ownerOf with Validator function
      await nft.mint("dd", { from: signer2 });

      const tx = {
        groupId: 7,
        nonce: 1,
        calls: [
          {
            value: 0,
            to: token20.address,
            method: "transfer",
            params: [
              { name: "to", type: "address", value: accounts[11] },
              { name: "token_amount", type: "uint256", value: "15" },
            ],
            flow: Flow.OK_CONT_FAIL_JUMP,
            jump: 1,
            signer: signer1,
          },
          {
            value: 0,
            to: token20.address,
            method: "transfer",
            params: [
              { name: "to", type: "address", value: accounts[12] },
              { name: "token_amount", type: "uint256", value: "20" },
            ],
            signer: signer2,
          },
          {
            value: 0,
            to: token20.address,
            method: "balanceOf",
            params: [{ name: "account", type: "address", value: accounts[11] }],
            validator: {
              method: "greaterThan",
              params: {
                valueToCompare: "10054",
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
          {
            value: 0,
            to: token20.address,
            method: "balanceOf",
            params: [{ name: "account", type: "address", value: accounts[11] }],
            validator: {
              method: "greaterEqual",
              params: {
                valueToCompare: "10055",
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
          {
            value: 0,
            to: token20.address,
            method: "balanceOf",
            params: [{ name: "account", type: "address", value: accounts[11] }],
            validator: {
              method: "lessThan",
              params: {
                valueToCompare: "10056",
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
          {
            value: 0,
            to: token20.address,
            method: "balanceOf",
            params: [{ name: "account", type: "address", value: accounts[11] }],
            validator: {
              method: "lessEqual",
              params: {
                valueToCompare: "10055",
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
          {
            value: 0,
            to: token20.address,
            method: "balanceOf",
            params: [{ name: "account", type: "address", value: accounts[11] }],
            validator: {
              method: "betweenEqual",
              params: {
                value1ToCompare: "10055",
                value2ToCompare: "10060",
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
          {
            value: 0,
            to: token20.address,
            method: "balanceOf",
            params: [{ name: "account", type: "address", value: accounts[11] }],
            validator: {
              method: "betweenNotEqual",
              params: {
                value1ToCompare: "10050",
                value2ToCompare: "10080",
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
          {
            value: 0,
            to: nft.address,
            method: "ownerOf",
            params: [{ name: "tokenId", type: "uint256", value: "1" }],
            validator: {
              method: "addressesCompare",
              params: {
                addressToCompare: signer2,
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
        ],
      };

      const call = await batchMultiSigCall.addBatchCall(tx);
      console.log(JSON.stringify(call, null, 2));

      expect(batchMultiSigCall.calls.length).to.eq(1);
    });
    it("Should add multiple batchMulticalls", async () => {
      const signer1 = getSigner(10);
      const signer2 = getSigner(11);

      const txs = [
        {
          groupId: 7,
          nonce: 2,
          calls: [
            {
              value: 0,
              to: token20.address,
              method: "transfer",
              params: [
                { name: "to", type: "address", value: accounts[11] },
                { name: "token_amount", type: "uint256", value: "15" },
              ],
              signer: signer1,
            },
            {
              value: 0,
              to: token20.address,
              method: "transfer",
              params: [
                { name: "to", type: "address", value: accounts[12] },
                { name: "token_amount", type: "uint256", value: "20" },
              ],
              signer: signer2,
            },
          ],
        },
        {
          groupId: 7,
          nonce: 3,
          calls: [
            {
              value: 0,
              to: token20.address,
              method: "transfer",
              params: [
                { name: "to", type: "address", value: accounts[11] },
                { name: "token_amount", type: "uint256", value: "15" },
              ],
              signer: signer1,
            },
            {
              value: 0,
              to: token20.address,
              method: "transfer",
              params: [
                { name: "to", type: "address", value: accounts[12] },
                { name: "token_amount", type: "uint256", value: "20" },
              ],
              signer: signer2,
            },
          ],
        },
      ];

      await batchMultiSigCall.addMultipleBatchCalls(txs);

      expect(batchMultiSigCall.calls.length).to.eq(3);
    });
    it("Should decode limits", async () => {
      const encodedLimits = batchMultiSigCall.calls[0].encodedLimits;
      const decodedLimits = batchMultiSigCall.decodeLimits(encodedLimits);

      expect(decodedLimits.maxGasPrice).to.eq("25000000000");
    });
    it("Should decode transactions", async () => {
      const txs = batchMultiSigCall.calls[1].mcall.map((item) => ({
        encodedMessage: item.encodedMessage,
        encodedDetails: item.encodedDetails,
        params:
          item.functionSignature !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
            ? [
                { type: "address", name: "to" },
                { type: "uint256", name: "token_amount" },
              ]
            : [],
      }));
      const decodedTxs = batchMultiSigCall.decodeTransactions(txs);

      expect(decodedTxs[0].token_amount).to.eq("15");
    });
    it("Should edit batchTx", async () => {
      const signer1 = getSigner(10);
      const signer2 = getSigner(11);

      const tx = {
        groupId: 7,
        nonce: 3,
        calls: [
          {
            value: 0,
            to: token20.address,
            method: "transfer",
            params: [
              { name: "to", type: "address", value: accounts[11] },
              { name: "token_amount", type: "uint256", value: "15" },
            ],
            signer: signer1,
          },
          {
            value: 15,
            to: accounts[12],
            signer: signer2,
          },
        ],
      };
      const call = await batchMultiSigCall.editBatchCall(2, tx);

      expect(call.mcall[1].value).to.eq(15);
    });

    it("Should edit multiCallTx in batchTx", async () => {
      const tx = {
        value: 25,
        to: accounts[13],
        signer: getSigner(11),
      };
      const call = await batchMultiSigCall.editMultiCallTx(2, 1, tx);

      expect(call.mcall[1].value).to.eq(25);
    });
    it("Should remove a multiCallTx in batchTx", async () => {
      const call = await batchMultiSigCall.removeMultiCallTx(2, 1);

      expect(call.mcall.length).to.eq(1);
    });
    it("Should remove batchTx", async () => {
      const calls = await batchMultiSigCall.removeBatchCall(1);
      expect(calls.length).to.eq(2);
    });
  });
  describe("BatchMultiSigCall with variables", async () => {
    let batchMultiSigCall;
    it("Should add variables", async () => {
      batchMultiSigCall = new BatchMultiSigCall(web3, factoryProxy.address);

      batchMultiSigCall.createVariable("accountAddress");
      batchMultiSigCall.createVariable("variableToBeRemoved"); // Random variable that will be removed
      batchMultiSigCall.createVariable("signerAddress");
      batchMultiSigCall.createVariable("ERC20Address");

      batchMultiSigCall.createVariable("Random", 20);
    });

    it("Should add batchMultiCall", async () => {
      const signer2 = getSigner(11);

      const tx = {
        groupId: 8,
        nonce: 1,
        calls: [
          {
            value: 0,
            to: "ERC20Address",
            method: "transfer",
            params: [
              { name: "to", type: "address", variable: "accountAddress" },
              { name: "token_amount", type: "uint256", value: "15" },
            ],
            signer: "signerAddress",
          },
          {
            value: 0,
            to: token20.address,
            method: "balanceOf",
            params: [{ name: "account", type: "address", value: accounts[11] }],
            validator: {
              method: "greaterThan",
              params: {
                valueToCompare: "10",
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
          {
            value: 0,
            to: token20.address,
            method: "transfer",
            params: [
              { name: "to", type: "address", variable: "accountAddress" },
              { name: "token_amount", type: "uint256", valueFromTx: 1 },
            ],
            signer: signer2,
          },
        ],
      };

      await batchMultiSigCall.addBatchCall(tx);

      expect(batchMultiSigCall.calls.length).to.eq(1);
    });
    it("Should remove variables", async () => {
      await batchMultiSigCall.removeVariable("variableToBeRemoved");

      expect(batchMultiSigCall.variables.length).to.eq(3);
    });
    it("Should  get variables as bytes32", async () => {
      batchMultiSigCall.addVariableValue("accountAddress", accounts[12]);
      batchMultiSigCall.addVariableValue("signerAddress", getSigner(10));
      batchMultiSigCall.addVariableValue("ERC20Address", token20.address);

      const variables = batchMultiSigCall.getVariablesAsBytes32();

      expect(variables[0]).to.eq("0x000000000000000000000000C1B72812552554873dEd3eaC0B588cE78C3673E1");
    });
  });
  describe("BatchMultiSigCall function", function () {
    let batchMultiSigCall;
    it("Should add batchMulticall", async () => {
      batchMultiSigCall = new BatchMultiSigCall(web3, factoryProxy.address);

      const signer1 = getSigner(10);
      const signer2 = getSigner(11);

      // Minting NFT for signer2 to check ownerOf with Validator function
      await nft.mint("dd", { from: signer2 });

      const tx = {
        groupId: 7,
        nonce: 1,
        calls: [
          {
            value: 0,
            to: token20.address,
            method: "transfer",
            params: [
              { name: "to", type: "address", value: accounts[11] },
              { name: "token_amount", type: "uint256", value: "15" },
            ],
            flow: Flow.OK_CONT_FAIL_JUMP,
            jump: 1,
            signer: signer1,
          },
          {
            value: 0,
            to: token20.address,
            method: "transfer",
            params: [
              { name: "to", type: "address", value: accounts[12] },
              { name: "token_amount", type: "uint256", value: "20" },
            ],
            signer: signer2,
          },
          {
            value: 0,
            to: token20.address,
            method: "balanceOf",
            params: [{ name: "account", type: "address", value: accounts[11] }],
            validator: {
              method: "greaterThan",
              params: {
                valueToCompare: "10054",
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
          {
            value: 0,
            to: token20.address,
            method: "balanceOf",
            params: [{ name: "account", type: "address", value: accounts[11] }],
            validator: {
              method: "greaterEqual",
              params: {
                valueToCompare: "10055",
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
          {
            value: 0,
            to: token20.address,
            method: "balanceOf",
            params: [{ name: "account", type: "address", value: accounts[11] }],
            validator: {
              method: "lessThan",
              params: {
                valueToCompare: "10056",
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
          {
            value: 0,
            to: token20.address,
            method: "balanceOf",
            params: [{ name: "account", type: "address", value: accounts[11] }],
            validator: {
              method: "lessEqual",
              params: {
                valueToCompare: "10055",
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
          {
            value: 0,
            to: token20.address,
            method: "balanceOf",
            params: [{ name: "account", type: "address", value: accounts[11] }],
            validator: {
              method: "betweenEqual",
              params: {
                value1ToCompare: "10055",
                value2ToCompare: "10060",
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
          {
            value: 0,
            to: token20.address,
            method: "balanceOf",
            params: [{ name: "account", type: "address", value: accounts[11] }],
            validator: {
              method: "betweenNotEqual",
              params: {
                value1ToCompare: "10050",
                value2ToCompare: "10080",
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
          {
            value: 0,
            to: nft.address,
            method: "ownerOf",
            params: [{ name: "tokenId", type: "uint256", value: "1" }],
            validator: {
              method: "addressesCompare",
              params: {
                addressToCompare: signer2,
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
        ],
      };

     const call = await batchMultiSigCall.addBatchCall(tx);
     console.log(JSON.stringify(call,m n));

      expect(batchMultiSigCall.calls.length).to.eq(1);
    });
    it("Should add multiple batchMulticalls", async () => {
      const signer1 = getSigner(10);
      const signer2 = getSigner(11);

      const txs = [
        {
          groupId: 7,
          nonce: 2,
          calls: [
            {
              value: 0,
              to: token20.address,
              method: "transfer",
              params: [
                { name: "to", type: "address", value: accounts[11] },
                { name: "token_amount", type: "uint256", value: "15" },
              ],
              signer: signer1,
            },
            {
              value: 0,
              to: token20.address,
              method: "transfer",
              params: [
                { name: "to", type: "address", value: accounts[12] },
                { name: "token_amount", type: "uint256", value: "20" },
              ],
              signer: signer2,
            },
          ],
        },
        {
          groupId: 7,
          nonce: 3,
          calls: [
            {
              value: 0,
              to: token20.address,
              method: "transfer",
              params: [
                { name: "to", type: "address", value: accounts[11] },
                { name: "token_amount", type: "uint256", value: "15" },
              ],
              signer: signer1,
            },
            {
              value: 0,
              to: token20.address,
              method: "transfer",
              params: [
                { name: "to", type: "address", value: accounts[12] },
                { name: "token_amount", type: "uint256", value: "20" },
              ],
              signer: signer2,
            },
          ],
        },
      ];

      await batchMultiSigCall.addMultipleBatchCalls(txs);

      expect(batchMultiSigCall.calls.length).to.eq(3);
    });
    it("Should decode limits", async () => {
      const encodedLimits = batchMultiSigCall.calls[0].encodedLimits;
      const decodedLimits = batchMultiSigCall.decodeLimits(encodedLimits);

      expect(decodedLimits.maxGasPrice).to.eq("25000000000");
    });
    it("Should decode transactions", async () => {
      const txs = batchMultiSigCall.calls[1].mcall.map((item) => ({
        encodedMessage: item.encodedMessage,
        encodedDetails: item.encodedDetails,
        params:
          item.functionSignature !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
            ? [
                { type: "address", name: "to" },
                { type: "uint256", name: "token_amount" },
              ]
            : [],
      }));
      const decodedTxs = batchMultiSigCall.decodeTransactions(txs);

      expect(decodedTxs[0].token_amount).to.eq("15");
    });
    it("Should edit batchTx", async () => {
      const signer1 = getSigner(10);
      const signer2 = getSigner(11);

      const tx = {
        groupId: 7,
        nonce: 3,
        calls: [
          {
            value: 0,
            to: token20.address,
            method: "transfer",
            params: [
              { name: "to", type: "address", value: accounts[11] },
              { name: "token_amount", type: "uint256", value: "15" },
            ],
            signer: signer1,
          },
          {
            value: 15,
            to: accounts[12],
            signer: signer2,
          },
        ],
      };
      const call = await batchMultiSigCall.editBatchCall(2, tx);

      expect(call.mcall[1].value).to.eq(15);
    });

    it("Should edit multiCallTx in batchTx", async () => {
      const tx = {
        value: 25,
        to: accounts[13],
        signer: getSigner(11),
      };
      const call = await batchMultiSigCall.editMultiCallTx(2, 1, tx);

      expect(call.mcall[1].value).to.eq(25);
    });
    it("Should remove a multiCallTx in batchTx", async () => {
      const call = await batchMultiSigCall.removeMultiCallTx(2, 1);

      expect(call.mcall.length).to.eq(1);
    });
    it("Should remove batchTx", async () => {
      const calls = await batchMultiSigCall.removeBatchCall(1);
      expect(calls.length).to.eq(2);
    });
  });
  describe("BatchMultiSigCall with variables", async () => {
    let batchMultiSigCall;
    it("Should add variables", async () => {
      batchMultiSigCall = new BatchMultiSigCall(web3, factoryProxy.address);

      batchMultiSigCall.createVariable("accountAddress");
      batchMultiSigCall.createVariable("variableToBeRemoved"); // Random variable that will be removed
      batchMultiSigCall.createVariable("signerAddress");
      batchMultiSigCall.createVariable("ERC20Address");

      batchMultiSigCall.createVariable("Random", 20);
    });

    it("Should add batchMultiCall", async () => {
      const signer2 = getSigner(11);

      const tx = {
        groupId: 8,
        nonce: 1,
        calls: [
          {
            value: 0,
            to: "ERC20Address",
            method: "transfer",
            params: [
              { name: "to", type: "address", variable: "accountAddress" },
              { name: "token_amount", type: "uint256", value: "15" },
            ],
            signer: "signerAddress",
          },
          {
            value: 0,
            to: token20.address,
            method: "balanceOf",
            params: [{ name: "account", type: "address", value: accounts[11] }],
            validator: {
              method: "greaterThan",
              params: {
                valueToCompare: "10",
              },
              validatorAddress: validator.address,
            },
            signer: signer2,
          },
          {
            value: 0,
            to: token20.address,
            method: "transfer",
            params: [
              { name: "to", type: "address", variable: "accountAddress" },
              { name: "token_amount", type: "uint256", valueFromTx: 1 },
            ],
            signer: signer2,
          },
        ],
      };

      await batchMultiSigCall.addBatchCall(tx);

      expect(batchMultiSigCall.calls.length).to.eq(1);
    });
    it("Should remove variables", async () => {
      await batchMultiSigCall.removeVariable("variableToBeRemoved");

      expect(batchMultiSigCall.variables.length).to.eq(3);
    });
    it("Should  get variables as bytes32", async () => {
      batchMultiSigCall.addVariableValue("accountAddress", accounts[12]);
      batchMultiSigCall.addVariableValue("signerAddress", getSigner(10));
      batchMultiSigCall.addVariableValue("ERC20Address", token20.address);

      const variables = batchMultiSigCall.getVariablesAsBytes32();

      expect(variables[0]).to.eq("0x000000000000000000000000C1B72812552554873dEd3eaC0B588cE78C3673E1");
    });
  });
});
