const { artifacts, web3, ethers } = require("hardhat");
const { BatchMultiSigCall } = require("../dist/index.js");
const assert = require("assert");
//const ABI = require("../src/abi/factoryProxy_.abi.json");
const { expect } = require("chai");
const { Flow } = require("../dist/constants.js");
const { TypedDataUtils } = require("ethers-eip712");

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
  let instance;
  let factory;
  let factoryProxy;
  let token20;
  let kiro;
  let oracle;
  let activatorContract;
  let validator;
  let accounts = [];
  let factoryOwner3;
  let owner;
  let user1;
  let user2;
  let user3;
  let user4;
  let instances = [];
  let nft;
  let uniSwapPair;
  let activators;
  let weth;
  let vault2, vault10, vault11, vault12, vault13;

  const val1 = web3.utils.toWei("0.5", "gwei");
  const val2 = web3.utils.toWei("0.4", "gwei");
  const val3 = web3.utils.toWei("0.6", "gwei");
  const valBN = web3.utils.toBN(val1).add(web3.utils.toBN(val2)).add(web3.utils.toBN(val3));

  const gas = 7000000;
  const userCount = 2;

  const getSigner = (index) => {
    return accounts[index];
  };

  const getPrivateKey = (address) => {
    // const wallet = web3.currentProvider.wallets[address.toLowerCase()]
    if (address === owner) {
      return "0x5f055f3bc7f2c8cabcc5132d97d6b594c25becbc57139221f1ef89263efc99c7"; // `0x${wallet._privKey.toString('hex')}`
    }
    if (address === accounts[10]) {
      return "0x557bca6ef564e9573c073ca84c6b8093063221807abc5abf784b9c0ad1cc94a1";
    }
    if (address === accounts[11]) {
      return "0x90f789c3b13f709b8638f8641e5123cc06e540e5dcc34287b820485c1948b9f5";
    }
  };

  before("setup contract for the test", async () => {
    accounts = await web3.eth.getAccounts();
    factoryOwner3 = accounts[2];
    owner = accounts[3];
    user1 = accounts[4];
    user2 = accounts[5];
    user3 = accounts[6];
    user4 = accounts[8];

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

    // await sw_factory_proxy.transferOwnership(multiSig.address, { from: owner });
    // /// await ens.setAddress('user10.eth', accounts[10])
    // await multiSig.setOwnTarget_(sw_factory_proxy.address, {
    //   from: factoryOwner1,
    // });
    // await multiSig.setOwnTarget_(sw_factory_proxy.address, {
    //   from: factoryOwner2,
    // });

    //const sw_factory_proxy_ms = await FactoryProxy.at(multiSig.address);

    factory = await Factory.at(sw_factory_proxy.address);
    factoryProxy = await FactoryProxy_.at(sw_factory_proxy.address);

    const core = await WalletCore.new({ from: factoryOwner3 });
    const version = await RecoveryWallet.new(core.address, ZERO_ADDRESS, {
      from: factoryOwner3,
    });
    token20 = await ERC20Token.new("Kirobo ERC20 Token", "KDB20", {
      from: owner,
    });
    kiro = await ERC20Token.new("Kirobo ERC20 Token", "KDB20", { from: owner });
    weth = await ERC20Token.new("weth ERC20 Token", "WETH", { from: owner });

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

    // await multiSig.setOwnTarget_(factory.address, { from: factoryOwner1 });
    // await multiSig.setOwnTarget_(factory.address, { from: factoryOwner3 });

    // const factory_ms = await Factory.at(multiSig.address);

    // await factory_ms.addVersion(version.address, oracle.address, {
    //   from: factoryOwner1,
    // });
    // await factory_ms.addVersion(version.address, oracle.address, {
    //   from: factoryOwner2,
    // });
    // await factory_ms.deployVersion(await version.version(), {
    //   from: factoryOwner2,
    // });
    // await factory_ms.deployVersion(await version.version(), {
    //   from: factoryOwner1,
    // });
    await factory.addVersion(version.address, oracle.address, { from: owner });
    await factory.deployVersion(await version.version(), { from: owner });
    await factory.createWallet(false, { from: owner });
    await factory.createWallet(false, { from: accounts[1] });
    await factory.createWallet(false, { from: accounts[2] });
    await factory.createWallet(false, { from: accounts[10] });
    await factory.createWallet(false, { from: accounts[11] });
    await factory.createWallet(false, { from: accounts[12] });
    await factory.createWallet(false, { from: accounts[13] });

    instance = await RecoveryWallet.at(await factory.getWallet(owner));
    vault2 = await RecoveryWallet.at(await factory.getWallet(accounts[2]));
    vault10 = await RecoveryWallet.at(await factory.getWallet(accounts[10]));
    vault11 = await RecoveryWallet.at(await factory.getWallet(accounts[11]));
    vault12 = await RecoveryWallet.at(await factory.getWallet(accounts[12]));
    vault13 = await RecoveryWallet.at(await factory.getWallet(accounts[13]));

    await oracle.update721(token20.address, true, { from: owner });
    await oracle.update721(kiro.address, true, { from: owner });
    //await oracle.cancel({from: factoryOwner2});
    await oracle.update20(token20.address, true, { from: owner });
    await oracle.update20(kiro.address, true, { from: owner });

    // await multiSig.setOwnTarget_(sw_factory_proxy.address, {
    //   from: factoryOwner1,
    // });
    // await multiSig.setOwnTarget_(sw_factory_proxy.address, {
    //   from: factoryOwner2,
    // });

    //await sw_factory_proxy_ms.setActivator(activator, { from: factoryOwner2 });
    //await sw_factory_proxy_ms.setActivator(activator, { from: factoryOwner3 });

    // await sw_factory_proxy_ms.setLocalEns("token.kiro.eth", token20.address, {
    //   from: factoryOwner1,
    // });
    // await sw_factory_proxy_ms.setLocalEns("token.kiro.eth", token20.address, {
    //   from: factoryOwner3,
    // });

    validator = await Validator.new({ from: owner });
    nft = await ERC721.new("NFT", "NFT contract", { from: owner });
    uniSwapPair = await UniSwapPair.new(kiro.address, weth.address, {
      from: owner,
    });
    let price0 = "712649162089556156052513422898140685241";
    let price1 = "434616173344705147255651977175731914782270922";
    await uniSwapPair.updatePriceCumulativesLast(price0, price1);
    activators = await Activators.new(sw_factory_proxy.address, kiro.address, uniSwapPair.address, { from: owner });
    await sw_factory_proxy_.setActivator_(activators.address, { from: owner });
    await activators.addActivator(instance.address, { from: owner, nonce: await web3.eth.getTransactionCount(owner) });
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
      await token20.mint(accounts[10], 10000, {
        from: owner,
        nonce: await web3.eth.getTransactionCount(owner),
      });

      for (let i = 10; i < 10 + userCount; ++i) {
        await token20.mint(accounts[i], 10000, {
          from: owner,
          nonce: await web3.eth.getTransactionCount(owner),
        });
      }
      for (let i = 0; i < 20; ++i) {
        await kiro.mint(accounts[i], "7000000000000000000", {
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
        await kiro.mint(instance, 10000, {
          from: owner,
          nonce: await web3.eth.getTransactionCount(owner),
        });
      }

      await kiro.approve(activators.address, "10000000000000000000", { from: accounts[1] });
      await kiro.approve(activators.address, "10000000000000000000", { from: accounts[2] });
      await kiro.approve(activators.address, "10000000000000000000", { from: accounts[3] });
      await kiro.approve(activators.address, "10000000000000000000", { from: accounts[10] });
      await kiro.approve(activators.address, "10000000000000000000", { from: accounts[11] });
      await kiro.approve(activators.address, "10000000000000000000", { from: accounts[12] });
      await kiro.approve(activators.address, "10000000000000000000", { from: accounts[13] });

      await instance.approveERC20(kiro.address, activators.address, "10000000000000000000", { from: accounts[3] });

      await activators.addVaultAllowance(instance.address, "5000000000000000000", {
        from: accounts[3],
        nonce: await web3.eth.getTransactionCount(accounts[3]),
      });
      await activators.addVaultAllowance(vault2.address, "5000000000000000000", {
        from: accounts[2],
        nonce: await web3.eth.getTransactionCount(accounts[2]),
      });
      await activators.addVaultAllowance(vault10.address, "5000000000000000000", {
        from: accounts[10],
        nonce: await web3.eth.getTransactionCount(accounts[10]),
      });
      await activators.addVaultAllowance(vault11.address, "5000000000000000000", {
        from: accounts[11],
        nonce: await web3.eth.getTransactionCount(accounts[11]),
      });
      await activators.addVaultAllowance(vault12.address, "5000000000000000000", {
        from: accounts[12],
        nonce: await web3.eth.getTransactionCount(accounts[12]),
      });
      await activators.addVaultAllowance(vault13.address, "5000000000000000000", {
        from: accounts[13],
        nonce: await web3.eth.getTransactionCount(accounts[13]),
      });

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

      const balance = await token20.balanceOf(accounts[11]);

      console.log(balance.toString());

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
                valueToCompare: "10014",
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
                value1ToCompare: "10014",
                value2ToCompare: "10020",
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
    it("Should execute", async () => {
      const calls = batchMultiSigCall.calls;
      const signer = getSigner(10);
      const signer2 = getSigner(11);

      const getSignature = (messageDigest, signer) => {
        const signingKey = new ethers.utils.SigningKey(getPrivateKey(signer));
        let signature = signingKey.signDigest(messageDigest);
        signature.v = "0x" + signature.v.toString(16);

        return signature;
      };

      const signedCalls = calls.map((item) => {
        const messageDigest = TypedDataUtils.encodeDigest(item.typedData);

        const signatures = [signer, signer2].map((item) => getSignature(messageDigest, item));
        return { ...item, signatures };
      });

      const data = activators.contract.methods
        .activateBatchMultiSigCall(signedCalls, batchMultiSigCall.getVariablesAsBytes32())
        .encodeABI();

      // console.log('final Data', data);

      try {
        await instance.execute(activators.address, 0, data, {
          from: owner,
        });
      } catch (err) {
        console.log(err);
      }
    });
  });
});
