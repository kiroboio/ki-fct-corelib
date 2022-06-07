const { artifacts, web3, ethers } = require("hardhat");
const {
  BatchTransfer,
  BatchTransferPacked,
  BatchMultiCallPacked,
  BatchCallPacked,
  BatchCall,
  BatchMultiCall,
  BatchMultiSigCallPacked,
  BatchMultiSigCall,
  utils,
} = require("../dist/index.js");
const assert = require("assert");
const { expect } = require("chai");
const { TypedDataUtils } = require("ethers-eip712");
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

      const tx = {
        value: 0,
        to: token20.address,
        data: token20.contract.methods.transfer(accounts[11], 5).encodeABI(),
        groupId: 1,
        nonce: 1,
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

      expect(batchCall.calls.length).to.eq(1);
    });
    it("Should add multiple tx", async () => {
      const signer = getSigner(10);
      const txs = [
        {
          value: 0,
          to: token20.address,
          data: token20.contract.methods.transfer(accounts[11], 5).encodeABI(),
          methodInterface: "transfer(address,uint256)",
          groupId: 1,
          nonce: 2,
          method: "transfer",
          params: [
            { name: "to", type: "address", value: accounts[11] },
            { name: "token_amount", type: "uint256", value: "5" },
          ],
          signer,
          flags: {
            payment: true,
          },
        },
        {
          value: 5,
          to: accounts[11],
          groupId: 1,
          nonce: 3,
          signerPrivateKey: getPrivateKey(signer),
          signer,
        },
      ];
      await batchCall.addMultipleTx(txs);

      expect(batchCall.calls.length).to.eq(3);
    });
    it("Should execute", async () => {
      const calls = batchCall.calls;
      const signer = getSigner(10);

      const signedCalls = calls.map((item) => {
        const messageDigest = TypedDataUtils.encodeDigest(item.typedData);

        const signingKey = new ethers.utils.SigningKey(getPrivateKey(signer));
        let signature = signingKey.signDigest(messageDigest);
        signature.v = "0x" + signature.v.toString(16);

        return { ...item, ...signature, sessionId: item.sessionId + signature.v.slice(2).padStart(2, "0") };
      });

      const data = await factoryProxy.batchCall_(signedCalls, 1, true, { from: activator });

      expect(data).to.have.property("receipt");
    });
  });

  describe("BatchCallPacked function", function () {
    let batchCallPacked;
    it("Should add tx to batchCallPacked", async () => {
      batchCallPacked = new BatchCallPacked(web3, factoryProxy.address);

      const tx = {
        data: token20.contract.methods.transfer(accounts[12], 5).encodeABI(),
        groupId: 1,
        nonce: 4,
        value: 0,
        to: token20.address,
        signer: getSigner(10),
      };

      await batchCallPacked.addTx(tx);

      expect(batchCallPacked.calls.length).to.eq(1);
    });
    it("Should add multiple tx to batchCallPacked", async () => {
      const txs = [
        {
          data: "",
          groupId: 1,
          nonce: 5,
          value: 5,
          to: accounts[11],
          signer: getSigner(10),
          flags: {
            payment: true,
          },
        },
        {
          data: token20.contract.methods.balanceOf(accounts[13]).encodeABI(),
          value: 0,
          groupId: 1,
          nonce: 6,
          to: token20.address,
          signer: getSigner(10),
          flags: {
            payment: false,
            staticCall: true,
          },
        },
      ];
      await batchCallPacked.addMultipleTx(txs);

      expect(batchCallPacked.calls.length).to.eq(3);
    });
    it("Should decode data", async () => {
      const decodedData = batchCallPacked.decodeData(batchCallPacked.calls[1].hashedData);

      expect(decodedData.value).to.eq("5");
    });
    it("Should verify message", async () => {
      const FACTORY_DOMAIN_SEPARATOR = await factoryProxy.DOMAIN_SEPARATOR();

      const calls = batchCallPacked.calls;
      const msg = FACTORY_DOMAIN_SEPARATOR + web3.utils.sha3(calls[0].hashedData).slice(2);

      const sgn = web3.eth.accounts.sign(msg, getPrivateKey(calls[0].signer));

      const isVerified = utils.verifyMessage(msg, sgn.signature, calls[0].signer);

      expect(isVerified).to.eq(true);
    });
    it("Should execute", async () => {
      const calls = batchCallPacked.calls;
      const FACTORY_DOMAIN_SEPARATOR = await factoryProxy.DOMAIN_SEPARATOR();

      const signedCalls = calls.map((item) => {
        const msg = FACTORY_DOMAIN_SEPARATOR + web3.utils.sha3(item.hashedData).slice(2);

        const signature = web3.eth.accounts.sign(msg, getPrivateKey(item.signer));

        return {
          ...item,
          r: signature.r,
          s: signature.s,
          sessionId: item.sessionId + signature.v.slice(2).padStart(2, "0"),
        };
      });

      const data = await factoryProxy.batchCallPacked_(signedCalls, 1, true, { from: activator });

      expect(data).to.have.property("receipt");
    });
  });
  describe("BatchTransfer function", function () {
    let batchTransfer;
    it("Add tx for batchTransfer", async () => {
      batchTransfer = new BatchTransfer(web3, factoryProxy.address);
      const signer = getSigner(10);
      const tx = {
        token: ZERO_ADDRESS,
        groupId: 1,
        nonce: 7,
        to: accounts[12],
        value: 10,
        signer,
        flags: {
          payment: false,
        },
      };
      await batchTransfer.addTx(tx);

      expect(batchTransfer.calls.length).to.eq(1);
    });
    it("Should add multiple tx", async () => {
      const signer = getSigner(10);
      const txs = [
        {
          token: ZERO_ADDRESS,
          groupId: 1,
          nonce: 8,
          to: accounts[12],
          value: 10,
          signer,
          flags: {
            payment: true,
          },
        },
        {
          token: token20.address,
          groupId: 1,
          nonce: 9,
          to: accounts[11],
          value: 5,
          signer,
          flags: {
            payment: false,
          },
        },
      ];

      await batchTransfer.addMultipleTx(txs);

      expect(batchTransfer.calls.length).to.eq(3);
    });
    it("Should decode", async () => {
      const decodedData = batchTransfer.decodeData(batchTransfer.calls[0].hashedData);
      expect(decodedData.value).to.eq("10");
    });
    it("Should execute", async () => {
      const calls = batchTransfer.calls;
      const signer = getSigner(10);

      const signedCalls = calls.map((item) => {
        const messageDigest = TypedDataUtils.encodeDigest(item.typedData);

        const signingKey = new ethers.utils.SigningKey(getPrivateKey(signer));
        let signature = signingKey.signDigest(messageDigest);
        signature.v = "0x" + signature.v.toString(16);

        return { ...item, ...signature, sessionId: item.sessionId + signature.v.slice(2).padStart(2, "0") };
      });

      const data = await factoryProxy.batchTransfer_(signedCalls, 1, true, { from: activator });

      expect(data).to.have.property("receipt");
    });
  });
  describe("BatchTransferPacked function", function () {
    let batchTransferPacked;
    it("Add tx for batchTransfer", async () => {
      batchTransferPacked = new BatchTransferPacked(web3, factoryProxy.address);
      const signer = getSigner(10);
      const tx = {
        token: ZERO_ADDRESS,
        groupId: 1,
        nonce: 10,
        to: accounts[12],
        value: 10,
        signer,
        flags: {
          payment: false,
        },
      };
      await batchTransferPacked.addTx(tx);

      expect(batchTransferPacked.calls.length).to.eq(1);
    });
    it("Should add multiple tx", async () => {
      const signer = getSigner(10);
      const txs = [
        {
          token: ZERO_ADDRESS,
          groupId: 1,
          nonce: 11,
          to: accounts[12],
          value: 10,
          signer,
          flags: {
            payment: true,
          },
        },
        {
          token: token20.address,
          groupId: 1,
          nonce: 12,
          to: accounts[11],
          value: 5,
          signer,
          flags: {
            payment: false,
          },
        },
      ];

      await batchTransferPacked.addMultipleTx(txs);

      expect(batchTransferPacked.calls.length).to.eq(3);
    });
    it("Should decode", async () => {
      const decodedData = batchTransferPacked.decodeData(batchTransferPacked.calls[0].hashedData);
      expect(decodedData.value).to.eq("10");
    });
    it("Should execute", async () => {
      const calls = batchTransferPacked.calls;
      const FACTORY_DOMAIN_SEPARATOR = await factoryProxy.DOMAIN_SEPARATOR();

      const signedCalls = calls.map((item) => {
        const msg = FACTORY_DOMAIN_SEPARATOR + web3.utils.sha3(item.hashedData).slice(2);

        const signature = web3.eth.accounts.sign(msg, getPrivateKey(item.signer));

        return {
          ...item,
          r: signature.r,
          s: signature.s,
          sessionId: item.sessionId + signature.v.slice(2).padStart(2, "0"),
        };
      });

      const data = await factoryProxy.batchTransferPacked_(signedCalls, 1, true, { from: activator });

      expect(data).to.have.property("receipt");
    });
  });
});
