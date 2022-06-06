const { artifacts, web3 } = require("hardhat");
const {
  BatchTransfer,
  BatchTransferPacked,
  BatchMultiCallPacked,
  BatchCallPacked,
  BatchCall,
  BatchMultiCall,
  BatchMultiSigCallPacked,
  BatchMultiSigCall,
} = require("../dist/index.js");
const assert = require("assert");
const { expect } = require("chai");
const MultiSigWallet = artifacts.require("MultiSigWallet");
const WalletCore = artifacts.require("RecoveryWalletCore");
const Wallet = artifacts.require("RecoveryWallet");
const Oracle = artifacts.require("RecoveryOracle");
const Activator = artifacts.require("Activator");
const Factory = artifacts.require("Factory");
const FactoryProxy = artifacts.require("FactoryProxy");
const FactoryProxy_ = artifacts.require("FactoryProxy_");
const ERC20Token = artifacts.require("ERC20Token");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("FactoryProxy contract library", function () {
  let instance;
  let multiSig;
  let factory;
  let factoryProxy;
  let token20;
  let oracle;
  let activatorContract;
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

  describe("BatchCall function", async () => {
    let batchCall;
    it("Should add tx", async () => {
      batchCall = new BatchCall(web3, factoryProxy.address);
      const signer = getSigner(10);

      //   const tx = {
      //     value: 5,
      //     to: accounts[11],
      //     groupId: 1,
      //     nonce: 13,
      //     signer,
      //   };
      const tx = {
        value: 0,
        to: token20.address,
        data: token20.contract.methods.transfer(accounts[11], 5).encodeABI(),
        groupId: 1,
        nonce: 11,
        method: "transfer",
        params: [
          { name: "to", type: "address", value: accounts[11] },
          { name: "token_amount", type: "uint256", value: "5" },
        ],
        signer,
        flags: {
          payment: false,
        },
      };
      await batchCall.addTx(tx);

      const decodedData = batchCall.decodeData(batchCall.calls[0].hashedMessage, batchCall.calls[0].hashedTxMessage, [
        { type: "address", name: "to" },
        { type: "uint256", name: "token_amount" },
      ]);

      console.log(decodedData);

      expect(batchCall.calls.length).to.eq(1);
    });
  });
});
