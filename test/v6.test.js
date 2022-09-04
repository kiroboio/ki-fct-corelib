const util = require("util");
const { assert, expect } = require("chai");
const { artifacts, web3, ethers } = require("hardhat");
const { BatchMultiSigCall } = require("../dist");
const { TypedDataUtils } = require("ethers-eip712");
const { Flow } = require("../dist/constants");

const UniSwapPair = artifacts.require("UniSwapPair");
const Activators = artifacts.require("Activators");
const RecoveryWalletCore = artifacts.require("RecoveryWalletCore");
const RecoveryWallet = artifacts.require("RecoveryWallet");
const RecoveryOracle = artifacts.require("RecoveryOracle");
const Activator = artifacts.require("Activator");
const Factory = artifacts.require("Factory");
const FactoryProxy = artifacts.require("FactoryProxy");
const FactoryProxy_ = artifacts.require("FactoryProxy_");
const FCT_Controler = artifacts.require("FCT_Controller");
const FCT_BatchMultiSig = artifacts.require("FCT_BatchMultiSig");
const ERC20Token = artifacts.require("ERC20Token");
const Validator = artifacts.require("Validator");
const MultiplierTest = artifacts.require("MultiplyTest");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("batchMultiSigCall", () => {
  let vault1;
  let vault2;
  let vault10;
  let vault11;
  let vault12;
  let vault13;
  let factory;
  let factoryProxy;
  let fctController;
  let fctBatchMultiSig;
  let kiro;
  let weth;
  let oracle;
  let activatorC;
  let DOMAIN_SEPARATOR;
  let sw_factory_proxy_;
  let uniSwapPair;
  let activators;
  let validator;
  let multiplier;
  let accounts = [];
  let factoryOwner1 = accounts[0];
  let factoryOwner2 = accounts[1];
  let factoryOwner3 = accounts[2];
  let owner = accounts[3];
  let user1 = accounts[4];
  let user2 = accounts[5];
  let user3 = accounts[6];
  let activator = accounts[7];
  let operator = accounts[7];
  let user10 = accounts[10];
  let user11 = accounts[11];
  let user12 = accounts[12];
  let user13 = accounts[13];
  let user4 = accounts[8];

  const userCount = 2;
  const userCountParameters = 1;
  const val1 = web3.utils.toWei("0.5", "gwei");
  const val2 = web3.utils.toWei("0.4", "gwei");
  const val3 = web3.utils.toWei("0.6", "gwei");

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
  //const valBN = web3.utils.toBN(val1).add(web3.utils.toBN(val2)).add(web3.utils.toBN(val3));

  let OK_CONT_FAIL_REVERT; // 0x10
  let OK_CONT_FAIL_REVERT_MSG; // 'continue on success, revert on fail'
  before("setup contract for the test", async () => {
    accounts = await web3.eth.getAccounts();
    factoryOwner1 = accounts[0];
    factoryOwner2 = accounts[1];
    factoryOwner3 = accounts[2];
    owner = accounts[3];
    user1 = accounts[4];
    user2 = accounts[5];
    user3 = accounts[6];
    activator = accounts[7];
    operator = accounts[7];
    user10 = accounts[10];
    user11 = accounts[11];
    user12 = accounts[12];
    user13 = accounts[13];
    user4 = accounts[8];

    kiro = await ERC20Token.new("Kirobo ERC20 Token", "KDB20", { from: owner });
    weth = await ERC20Token.new("weth ERC20 Token", "WETH", { from: owner });

    fctController = await FCT_Controler.new(ZERO_ADDRESS, { from: owner });
    fctBatchMultiSig = await FCT_BatchMultiSig.new({ from: owner });

    const sw_factory = await Factory.new({
      from: owner,
      nonce: await web3.eth.getTransactionCount(owner),
    });

    const sw_factory_proxy__ = await FactoryProxy_.new({ from: owner });
    const sw_factory_proxy = await FactoryProxy.new(ZERO_ADDRESS, {
      from: owner,
    });
    await sw_factory_proxy.setTarget(sw_factory_proxy__.address, {
      from: owner,
    });
    sw_factory_proxy_ = await FactoryProxy_.at(sw_factory_proxy.address, {
      from: owner,
    });
    await sw_factory_proxy_.setTarget_(sw_factory.address, { from: owner });

    const createFee = "200000000000000000";
    factory = await Factory.at(sw_factory_proxy.address, {
      from: factoryOwner3,
    });
    factoryProxy = await FactoryProxy.at(sw_factory_proxy.address, {
      from: factoryOwner3,
    });

    const core = await RecoveryWalletCore.new({ from: factoryOwner3 });
    const version = await RecoveryWallet.new(core.address, ZERO_ADDRESS, fctController.address, {
      from: factoryOwner3,
    });
    activatorC = await Activator.new(kiro.address, sw_factory_proxy.address, {
      from: owner,
      nonce: await web3.eth.getTransactionCount(owner),
    });
    await activatorC.setBackupFees(createFee, { from: owner });
    await activatorC.setInheritanceFees(createFee, { from: owner });
    await activatorC.setTokenInheritanceFees(createFee, { from: owner });
    oracle = await RecoveryOracle.new(activatorC.address, {
      from: owner,
      nonce: await web3.eth.getTransactionCount(owner),
    });

    await factory.addVersion(version.address, oracle.address, { from: owner });
    await factory.deployVersion(await version.version(), { from: owner });
    await factory.createWallet(false, { from: user1 });
    await factory.createWallet(false, { from: user2 });
    await factory.createWallet(false, { from: user10 });
    await factory.createWallet(false, { from: user11 });
    await factory.createWallet(false, { from: user12 });
    await factory.createWallet(false, { from: user13 });
    uniSwapPair = await UniSwapPair.new(kiro.address, weth.address, {
      from: owner,
    });
    let price0 = "712649162089556156052513422898140685241";
    let price1 = "434616173344705147255651977175731914782270922";
    await uniSwapPair.updatePriceCumulativesLast(price0, price1);

    activators = await Activators.new(
      sw_factory_proxy.address,
      fctController.address,
      kiro.address,
      uniSwapPair.address,
      { from: owner }
    );

    await fctController.addTarget(fctBatchMultiSig.address, { from: owner });
    await fctController.setActivator(activators.address, { from: owner });
    await fctController.setLocalEns("token.kiro.eth", kiro.address, {
      from: owner,
    });

    vault1 = await RecoveryWallet.at(await factory.getWallet(user1));
    vault2 = await RecoveryWallet.at(await factory.getWallet(user2));
    vault10 = await RecoveryWallet.at(await factory.getWallet(user10));
    vault11 = await RecoveryWallet.at(await factory.getWallet(user11));
    vault12 = await RecoveryWallet.at(await factory.getWallet(user12));
    vault13 = await RecoveryWallet.at(await factory.getWallet(user13));
    await oracle.update20(kiro.address, true, { from: owner });
    await sw_factory_proxy_.setActivator_(activators.address, { from: owner });
    await factoryProxy.setLocalEns("token.kiro.eth", kiro.address, {
      from: owner,
    });
    multiplier = await MultiplierTest.new({ from: owner });
    validator = await Validator.new({ from: owner });

    OK_CONT_FAIL_REVERT = (await fctBatchMultiSig.OK_CONT_FAIL_REVERT()).toString();
    OK_CONT_FAIL_REVERT_MSG = await fctBatchMultiSig.OK_CONT_FAIL_REVERT_MSG();
  });

  it("should create empty wallet", async () => {
    const balance = await web3.eth.getBalance(vault1.address);
    assert.equal(balance.toString(10), web3.utils.toBN("0").toString(10));
    await web3.eth.sendTransaction({
      from: owner,
      value: val2,
      to: vault1.address,
    });
    await web3.eth.sendTransaction({
      from: owner,
      value: val2,
      to: vault2.address,
    });
    await web3.eth.sendTransaction({
      from: owner,
      value: val2,
      to: vault11.address,
    });
    await web3.eth.sendTransaction({
      from: owner,
      value: val2,
      to: vault12.address,
    });
    await web3.eth.sendTransaction({
      from: owner,
      value: val2,
      to: vault13.address,
    });
    await web3.eth.sendTransaction({
      from: owner,
      value: val2,
      to: vault10.address,
    });
    await vault1.sendEther(user1, val2, { from: user1 });
    await vault2.sendEther(user1, val2, { from: user2 });
    //await vault11.sendEther(user1, val2, { from: user11 });

    /* const balance11 = await web3.eth.getBalance(vault11.address);
    console.log("balance11", balance11) */
  });

  it("only admin can add activator", async () => {
    try {
      await activators.addActivator(user1, {
        from: user2,
        nonce: await web3.eth.getTransactionCount(user2),
      });
      assert(false);
    } catch (err) {
      // assertRevert(err);
    }

    await activators.addActivator(user1, {
      from: owner,
      nonce: await web3.eth.getTransactionCount(owner),
    });
  });

  it("only admin can remove activator", async () => {
    try {
      await activators.removeActivator(user1, {
        from: user2,
        nonce: await web3.eth.getTransactionCount(user2),
      });
      assert(false);
    } catch (err) {
      //assertRevert(err);
    }

    await activators.removeActivator(user1, {
      from: owner,
      nonce: await web3.eth.getTransactionCount(owner),
    });
  });

  it("check kiro for eth ", async () => {
    const totalGasUsed = await activators.getAmountOfKiroForGivenEth(1909173750113105);
    console.log(`Total Gas used:`, totalGasUsed.toString());
  });

  //user1 -> vault1 -> activator
  //user2 -> vault2 -> vault user
  it("add vault allowance", async () => {
    await activators.addActivator(vault1.address, {
      from: owner,
      nonce: await web3.eth.getTransactionCount(owner),
    });
    await kiro.mint(vault2.address, "10000000000000000000");
    await kiro.mint(user3, "7000000000000000000");
    await kiro.mint(accounts[0], "7000000000000000000");
    await kiro.mint(accounts[1], "7000000000000000000");
    await kiro.mint(accounts[2], "7000000000000000000");
    await kiro.mint(accounts[3], "7000000000000000000");
    await kiro.mint(accounts[4], "7000000000000000000");
    await kiro.mint(accounts[5], "7000000000000000000");
    await kiro.mint(accounts[6], "7000000000000000000");
    await kiro.mint(accounts[7], "7000000000000000000");
    await kiro.mint(accounts[8], "7000000000000000000");
    await kiro.mint(accounts[9], "7000000000000000000");
    await kiro.mint(accounts[10], "7000000000000000000");
    await kiro.mint(accounts[11], "7000000000000000000");
    await kiro.mint(accounts[12], "7000000000000000000");
    await kiro.mint(accounts[13], "7000000000000000000");
    await kiro.mint(vault1.address, "7000000000000000000");
    await kiro.mint(vault2.address, "7000000000000000000");
    await kiro.mint(vault10.address, "7000000000000000000");
    await kiro.mint(vault11.address, "7000000000000000000");
    await kiro.mint(vault12.address, "7000000000000000000");
    await kiro.mint(vault13.address, "7000000000000000000");
    // await web3.eth.sendTransaction({ from: user2, value: val2, to: vault2.address });
    // await vault2.sendEther(user2, val1, { from: user2 });
    await kiro.approve(activators.address, "10000000000000000000", {
      from: user3,
    });
    await kiro.approve(activators.address, "10000000000000000000", {
      from: user10,
    });
    await activators.addVaultAllowance(vault2.address, "5000000000000000000", {
      from: user3,
      nonce: await web3.eth.getTransactionCount(user3),
    });
    await vault2.approveERC20(kiro.address, activators.address, "10000000000000000000", { from: user2 });
    const data = activators.contract.methods.addVaultAllowance(vault2.address, "5000000000000000000").encodeABI();
    await vault2.execute(activators.address, 0, data, {
      from: user2,
      nonce: await web3.eth.getTransactionCount(user2),
    });
    await vault10.approveERC20(kiro.address, activators.address, "10000000000000000000", { from: user10 });
    await vault11.approveERC20(kiro.address, activators.address, "10000000000000000000", { from: user11 });
    await vault12.approveERC20(kiro.address, activators.address, "10000000000000000000", { from: user12 });
    await vault13.approveERC20(kiro.address, activators.address, "10000000000000000000", { from: user13 });
    const data10 = activators.contract.methods.addVaultAllowance(vault10.address, "5000000000000000000").encodeABI();
    const data11 = activators.contract.methods.addVaultAllowance(vault11.address, "5000000000000000000").encodeABI();
    const data12 = activators.contract.methods.addVaultAllowance(vault12.address, "5000000000000000000").encodeABI();
    const data13 = activators.contract.methods.addVaultAllowance(vault13.address, "5000000000000000000").encodeABI();
    await vault10.execute(activators.address, 0, data10, {
      from: user10,
      nonce: await web3.eth.getTransactionCount(user10),
    });
    await vault11.execute(activators.address, 0, data11, {
      from: user11,
      nonce: await web3.eth.getTransactionCount(user11),
    });
    await vault12.execute(activators.address, 0, data12, {
      from: user12,
      nonce: await web3.eth.getTransactionCount(user12),
    });
    await vault13.execute(activators.address, 0, data13, {
      from: user13,
      nonce: await web3.eth.getTransactionCount(user13),
    });
  });

  describe("BatchMultiSigCall core lib", () => {
    let batchMultiSigCall;

    it("Should add call", async () => {
      batchMultiSigCall = new BatchMultiSigCall(ethers.provider, fctController.address);

      const call = {
        to: kiro.address,
        method: "balanceOf",
        params: [{ name: "account", type: "address", value: vault11.address }],
        from: vault11.address,
        options: {
          flow: Flow.OK_CONT_FAIL_STOP,
          jumpOnSuccess: 1,
          gasLimit: 10000000,
        },
      };

      const data = await batchMultiSigCall.create(call);

      expect(data).to.be.lengthOf(1);
    });
    it("Should add additional call", async () => {
      const call = {
        to: kiro.address,
        method: "transfer",
        params: [
          { name: "to", type: "address", value: accounts[12] },
          { name: "token_amount", type: "uint256", value: "20" },
        ],
        from: vault10.address,
      };

      const calls = await batchMultiSigCall.create(call);

      expect(calls).to.be.lengthOf(2);
    });
    it("Should add another call", async () => {
      const call = {
        to: kiro.address,
        method: "transfer",
        params: [
          { name: "to", type: "address", value: accounts[12] },
          { name: "token_amount", type: "uint256", value: "20" },
        ],
        from: vault10.address,
      };

      const calls = await batchMultiSigCall.create(call);

      expect(calls).to.be.lengthOf(3);
    });

    it("Should replace call", async () => {
      const call = {
        to: kiro.address,
        method: "transfer",
        params: [
          { name: "to", type: "address", value: accounts[12] },
          { name: "token_amount", type: "uint256", value: "30" },
        ],
        from: vault10.address,
      };

      const calls = batchMultiSigCall.replaceCall(call, 1);

      expect(calls).to.be.lengthOf(3) && expect(calls[1].params[1].value).to.eq("30");
    });

    // it("Should remove a call", async () => {
    //   const calls = batchMultiSigCall.removeCall(1);

    //   expect(calls).to.be.lengthOf(1);
    // });

    it("Should return a call", async () => {
      const call = batchMultiSigCall.getCall(0);

      expect(call.to).to.be.equal(kiro.address);
    });

    it("Should return length", async () => {
      const length = batchMultiSigCall.length;

      expect(length).to.be.equal(3);
    });

    it("Should create a FCT", async () => {
      const FCT = await batchMultiSigCall.getFCT();

      console.log(util.inspect(FCT, { showHidden: false, depth: null, colors: true }));
    });

    // it("Should execute batch", async () => {
    //   const FCT = await batchMultiSigCall.getFCT();
    //   // Here I get object with typedData, typeHash, sessionId, name and mcall array (MSCall[])

    //   const signer = getSigner(10);
    //   const signer2 = getSigner(11);

    //   const getSignature = (messageDigest, signer) => {
    //     const signingKey = new ethers.utils.SigningKey(getPrivateKey(signer));
    //     let signature = signingKey.signDigest(messageDigest);
    //     signature.v = "0x" + signature.v.toString(16);

    //     return signature;
    //   };

    //   // Signing the FCT
    //   const signedCalls = [FCT].map((item) => {
    //     const messageDigest = TypedDataUtils.encodeDigest(item.typedData);

    //     const signatures = [signer, signer2].map((item) => getSignature(messageDigest, item));
    //     return { ...item, signatures, variables: [], builder: ZERO_ADDRESS, externalSigners: [] };
    //   });

    //   const callData = fctBatchMultiSig.contract.methods
    //     .batchMultiSigCall_(await fctController.version(await fctBatchMultiSig.batchMultiSigCallID()), signedCalls)
    //     .encodeABI();

    //   await activators.addActivator(user1, {
    //     from: owner,
    //     nonce: await web3.eth.getTransactionCount(owner),
    //   });

    //   try {
    //     const res = await activators.activate(callData, { from: user1 });
    //     console.log(res);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // });
  });
});
