const { artifacts, web3 } = require("hardhat");
const { BatchMultiSigCall } = require("../dist/index.js");
const assert = require("assert");
const { expect } = require("chai");

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
  let instance;
  let multiSig;
  let factory;
  let factoryProxy;
  let token20;
  let oracle;
  let activatorContract;
  let validator;
  let nft;
  let accounts = [];
  let factoryOwner1;
  let factoryOwner2;
  let factoryOwner3;
  let owner;
  let user1;
  let user2;
  let user3;
  let user4;
  let activator;
  let instances = [];

  const val1 = web3.utils.toWei("0.5", "gwei");
  const val2 = web3.utils.toWei("0.4", "gwei");
  const val3 = web3.utils.toWei("0.6", "gwei");
  const valBN = web3.utils.toBN(val1).add(web3.utils.toBN(val2)).add(web3.utils.toBN(val3));

  const gas = 7000000;
  const userCount = 2;

  const getSigner = (index) => {
    return accounts[index];
  };

  //   const getPrivateKey = (address) => {
  //     // const wallet = web3.currentProvider.wallets[address.toLowerCase()]
  //     if (address === owner) {
  //       return "0x5f055f3bc7f2c8cabcc5132d97d6b594c25becbc57139221f1ef89263efc99c7"; // `0x${wallet._privKey.toString('hex')}`
  //     }
  //     if (address === accounts[10]) {
  //       return "0x557bca6ef564e9573c073ca84c6b8093063221807abc5abf784b9c0ad1cc94a1";
  //     }
  //     if (address === accounts[11]) {
  //       return "0x90f789c3b13f709b8638f8641e5123cc06e540e5dcc34287b820485c1948b9f5";
  //     }
  //   };

  before("setup contract for the test", async () => {
    accounts = await web3.eth.getAccounts();
    factoryOwner1 = accounts[0];
    factoryOwner2 = accounts[1];
    factoryOwner3 = accounts[2];
    owner = accounts[3];
    user1 = accounts[4];
    user2 = accounts[5];
    user3 = accounts[6];
    user4 = accounts[8];
    activator = accounts[7];

    multiSig = await MultiSigWallet.new(factoryOwner1, factoryOwner2, factoryOwner3);

    const sw_factory = await Factory.new({
      from: owner,
      nonce: await web3.eth.getTransactionCount(owner),
    }).on("receipt", function () {});
    const sw_factory_proxy = await FactoryProxy.new(ZERO_ADDRESS, {
      from: owner,
    }).on("receipt", function () {});

    const sw_factory_proxy__ = await FactoryProxy_.new({ from: owner });
    await sw_factory_proxy.setTarget(sw_factory_proxy__.address, {
      from: owner,
    });
    const sw_factory_proxy_ = await FactoryProxy_.at(sw_factory_proxy.address, {
      from: owner,
    });
    await sw_factory_proxy_.setTarget_(sw_factory.address, { from: owner });

    await sw_factory_proxy.transferOwnership(multiSig.address, { from: owner });
    /// await ens.setAddress('user10.eth', accounts[10])
    await multiSig.setOwnTarget_(sw_factory_proxy.address, {
      from: factoryOwner1,
    });
    await multiSig.setOwnTarget_(sw_factory_proxy.address, {
      from: factoryOwner2,
    });

    const sw_factory_proxy_ms = await FactoryProxy.at(multiSig.address);

    factory = await Factory.at(sw_factory_proxy.address);
    factoryProxy = await FactoryProxy_.at(sw_factory_proxy.address);

    const core = await WalletCore.new({ from: factoryOwner3 });
    const version = await Wallet.new(core.address, ZERO_ADDRESS, {
      from: factoryOwner3,
    });
    token20 = await ERC20Token.new("Kirobo ERC20 Token", "KDB20", {
      from: owner,
    });
    activatorContract = await Activator.new(token20.address, sw_factory_proxy.address, {
      from: owner,
      nonce: await web3.eth.getTransactionCount(owner),
    });
    oracle = await Oracle.new(activatorContract.address, {
      from: owner,
      nonce: await web3.eth.getTransactionCount(owner),
    });
    const createFee = 1000;
    await activatorContract.setBackupFees(createFee, { from: owner });
    await activatorContract.setInheritanceFees(createFee, { from: owner });
    await activatorContract.setTokenInheritanceFees(createFee, { from: owner });

    await multiSig.setOwnTarget_(factory.address, { from: factoryOwner1 });
    await multiSig.setOwnTarget_(factory.address, { from: factoryOwner3 });

    const factory_ms = await Factory.at(multiSig.address);

    await factory_ms.addVersion(version.address, oracle.address, {
      from: factoryOwner1,
    });
    await factory_ms.addVersion(version.address, oracle.address, {
      from: factoryOwner2,
    });
    await factory_ms.deployVersion(await version.version(), {
      from: factoryOwner2,
    });
    await factory_ms.deployVersion(await version.version(), {
      from: factoryOwner1,
    });
    await factory.createWallet(false, { from: owner });
    instance = await Wallet.at(await factory.getWallet(owner));

    await oracle.update721(token20.address, true, { from: owner });
    //await oracle.cancel({from: factoryOwner2});
    await oracle.update20(token20.address, true, { from: owner });

    await multiSig.setOwnTarget_(sw_factory_proxy.address, {
      from: factoryOwner1,
    });
    await multiSig.setOwnTarget_(sw_factory_proxy.address, {
      from: factoryOwner2,
    });

    await sw_factory_proxy_ms.setActivator(activator, { from: factoryOwner2 });
    await sw_factory_proxy_ms.setActivator(activator, { from: factoryOwner3 });

    await sw_factory_proxy_ms.setLocalEns("token.kiro.eth", token20.address, {
      from: factoryOwner1,
    });
    await sw_factory_proxy_ms.setLocalEns("token.kiro.eth", token20.address, {
      from: factoryOwner3,
    });

    validator = await Validator.new({ from: owner });
    nft = await ERC721.new("NFT", "NFT contract", { from: owner });
  });

  describe("Inital for factoryProxy", function () {
    it("should create an empty wallet", async () => {
      const balance = await web3.eth.getBalance(instance.address);
      assert.equal(balance.toString(10), web3.utils.toBN("0").toString(10));
    });

    it("should accept ether from everyone", async () => {
      await web3.eth.sendTransaction({
        gas,
        from: owner,
        value: val1,
        to: instance.address,
        nonce: await web3.eth.getTransactionCount(owner),
      });
      await web3.eth.sendTransaction({
        gas,
        from: user1,
        value: val2,
        to: instance.address,
        nonce: await web3.eth.getTransactionCount(user1),
      });
      await web3.eth.sendTransaction({
        gas,
        from: user2,
        value: val3,
        to: instance.address,
        nonce: await web3.eth.getTransactionCount(user2),
      });

      const balance = await web3.eth.getBalance(instance.address);
      assert.equal(balance.toString(10), valBN.toString(10));

      await token20.mint(user1, 10000, {
        from: owner,
        nonce: await web3.eth.getTransactionCount(owner),
      });
      await token20.mint(user2, 10000, {
        from: owner,
        nonce: await web3.eth.getTransactionCount(owner),
      });
      await token20.mint(user3, 10000, {
        from: owner,
        nonce: await web3.eth.getTransactionCount(owner),
      });
      await token20.mint(user4, 10000, {
        from: owner,
        nonce: await web3.eth.getTransactionCount(owner),
      });

      for (let i = 10; i < 10 + userCount; ++i) {
        await token20.mint(accounts[i], 10000, {
          from: owner,
          nonce: await web3.eth.getTransactionCount(owner),
        });
      }
      for (let i = 10; i < 20; /*10+userCount/2;*/ ++i) {
        await factory.createWallet(false, {
          from: accounts[i],
        });
        instances.push(await factory.getWallet(accounts[i]));
      }
      for (const instance of instances) {
        await token20.mint(instance, 10000, {
          from: owner,
          nonce: await web3.eth.getTransactionCount(owner),
        });
        await web3.eth.sendTransaction({
          from: owner,
          value: val1,
          to: instance,
          nonce: await web3.eth.getTransactionCount(owner),
        });
      }

      await token20.transfer(instance.address, 5000, {
        from: user1,
        nonce: await web3.eth.getTransactionCount(user1),
      });
      await token20.transfer(instance.address, 50, {
        from: user1,
        nonce: await web3.eth.getTransactionCount(user1),
      });
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
            flow: "OK_CONT_FAIL_JUMP",
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

      await batchMultiSigCall.addBatchCall(tx);

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

      console.log(decodedTxs);

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
