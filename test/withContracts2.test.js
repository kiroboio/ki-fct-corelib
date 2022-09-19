const util = require("util");
const { assert } = require("chai");
const { artifacts, web3, ethers } = require("hardhat");
const { BatchMultiSigCall, getPlugin, getPlugins, constants } = require("../dist");
const { TypedDataUtils } = require("ethers-eip712");
const { ERC20 } = require("@kirobo/ki-eth-fct-provider-ts");
const { Flow } = require("../dist/constants");

require("dotenv").config();

const UniSwapPair = artifacts.require("UniSwapPair");
const Actuator = artifacts.require("FCT_Actuator");
const Tokenomics = artifacts.require("FCT_Tokenomics");
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
const batchMultiSigSelector = "0xa7973c1f";

describe("BatchMultiSigCall", () => {
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
  let actuator;
  let tokenomics;
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

  const val2 = web3.utils.toWei("3.4", "gwei");

  const getPrivateKey = (address) => {
    // const wallet = web3.currentProvider.wallets[address.toLowerCase()]
    if (address === owner) {
      return "0x5f055f3bc7f2c8cabcc5132d97d6b594c25becbc57139221f1ef89263efc99c7"; // `0x${wallet._privKey.toString('hex')}`
    }
    if (address === accounts[5]) {
      return "0x6526bc2e0536920488919e6fd86845141eb2886294d576ceb29445e59b398fad";
    }
    if (address === accounts[10]) {
      return "0x557bca6ef564e9573c073ca84c6b8093063221807abc5abf784b9c0ad1cc94a1";
    }
    if (address === accounts[11]) {
      return "0x90f789c3b13f709b8638f8641e5123cc06e540e5dcc34287b820485c1948b9f5";
    }
    if (address === accounts[12]) {
      return "0x9a4a566d5c0fefaf2817dd2d31cd91ad2635c3eb06336ca14611ddb25a9d2bda";
    }
    if (address === accounts[13]) {
      return "0x071cf463bfe72143005c4c28b15f21bfafc43c21cb0617c2a7bd2c3acb244a30";
    }
  };

  const getSigner = (index) => {
    return accounts[index];
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
    activator = accounts[7];
    operator = accounts[7];
    user10 = accounts[10];
    user11 = accounts[11];
    user12 = accounts[12];
    user13 = accounts[13];
    user4 = accounts[8];

    kiro = await ERC20Token.new("Kirobo ERC20 Token", "KDB20", { from: owner });
    weth = await ERC20Token.new("weth ERC20 Token", "WETH", { from: owner });

    fctController = await FCT_Controler.new({ from: owner });
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

    actuator = await Actuator.new(
      // sw_factory_proxy.address,
      kiro.address,
      fctController.address,
      uniSwapPair.address,
      { from: owner }
    );

    tokenomics = await Tokenomics.new(actuator.address, { from: owner });
    await actuator.setTokenomics(tokenomics.address);

    await fctController.setActuator(actuator.address, { from: owner });
    await fctController.addTarget(fctBatchMultiSig.address, { from: owner });
    // await fctController.setActivator(actuator.address, { from: owner });
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
    await sw_factory_proxy_.setActivator_(actuator.address, { from: owner });
    await factoryProxy.setLocalEns("token.kiro.eth", kiro.address, {
      from: owner,
    });
    multiplier = await MultiplierTest.new({ from: owner });
    validator = await Validator.new({ from: owner });
  });

  it("should create empty wallet", async () => {
    const balance = await web3.eth.getBalance(vault1.address);
    //console.log("balance", balance)
    //console.log("user1", user1)
    //console.log("val2", val2)
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
  });

  it("check kiro for eth ", async () => {
    const totalGasUsed = await actuator.getAmountOfKiroForGivenEth(1909173750113105);
    console.log("totalGasUsed", totalGasUsed.toString());
  });

  it("add vault allowance", async () => {
    const INIT_KIRO_BALNACE = "10000" + "0".repeat(18);

    await kiro.mint(vault2.address, INIT_KIRO_BALNACE);
    await kiro.mint(user3, INIT_KIRO_BALNACE);
    await kiro.mint(accounts[0], INIT_KIRO_BALNACE);
    await kiro.mint(accounts[1], INIT_KIRO_BALNACE);
    await kiro.mint(accounts[2], INIT_KIRO_BALNACE);
    await kiro.mint(accounts[3], INIT_KIRO_BALNACE);
    await kiro.mint(accounts[4], INIT_KIRO_BALNACE);
    await kiro.mint(accounts[5], INIT_KIRO_BALNACE);
    await kiro.mint(accounts[6], INIT_KIRO_BALNACE);
    await kiro.mint(accounts[7], INIT_KIRO_BALNACE);
    await kiro.mint(accounts[8], INIT_KIRO_BALNACE);
    await kiro.mint(accounts[9], INIT_KIRO_BALNACE);
    await kiro.mint(accounts[10], INIT_KIRO_BALNACE);
    await kiro.mint(accounts[11], INIT_KIRO_BALNACE);
    await kiro.mint(accounts[12], INIT_KIRO_BALNACE);
    await kiro.mint(accounts[13], INIT_KIRO_BALNACE);
    await kiro.mint(vault1.address, INIT_KIRO_BALNACE);
    await kiro.mint(vault2.address, INIT_KIRO_BALNACE);
    await kiro.mint(vault10.address, INIT_KIRO_BALNACE);
    await kiro.mint(vault11.address, INIT_KIRO_BALNACE);
    await kiro.mint(vault12.address, INIT_KIRO_BALNACE);
    await kiro.mint(vault13.address, INIT_KIRO_BALNACE);
    // await web3.eth.sendTransaction({ from: user2, value: val2, to: vault2.address });
    // await vault2.sendEther(user2, val1, { from: user2 });

    const KIRO_FOR_FCT = "100" + "0".repeat(18);

    await kiro.approve(actuator.address, "10000000000000000000", {
      from: user1,
    });
    await actuator.deposit("10000000", { from: user1 });
    await kiro.approve(actuator.address, KIRO_FOR_FCT, {
      from: user3,
    });
    await kiro.approve(actuator.address, "10000000000000000000", {
      from: user10,
    });
    await actuator.addFundsTo(vault2.address, KIRO_FOR_FCT, {
      from: user3,
      nonce: await web3.eth.getTransactionCount(user3),
    });
    await vault2.approveERC20(kiro.address, actuator.address, KIRO_FOR_FCT, { from: user2 });
    const data = actuator.contract.methods.addFundsTo(vault2.address, KIRO_FOR_FCT).encodeABI();
    await vault2.execute(actuator.address, 0, data, {
      from: user2,
      nonce: await web3.eth.getTransactionCount(user2),
    });
    await vault10.approveERC20(kiro.address, actuator.address, KIRO_FOR_FCT, { from: user10 });
    await vault11.approveERC20(kiro.address, actuator.address, KIRO_FOR_FCT, { from: user11 });
    await vault12.approveERC20(kiro.address, actuator.address, KIRO_FOR_FCT, { from: user12 });
    await vault13.approveERC20(kiro.address, actuator.address, KIRO_FOR_FCT, { from: user13 });
    const data10 = actuator.contract.methods.addFundsTo(vault10.address, KIRO_FOR_FCT).encodeABI();
    const data11 = actuator.contract.methods.addFundsTo(vault11.address, KIRO_FOR_FCT).encodeABI();
    const data12 = actuator.contract.methods.addFundsTo(vault12.address, KIRO_FOR_FCT).encodeABI();
    const data13 = actuator.contract.methods.addFundsTo(vault13.address, KIRO_FOR_FCT).encodeABI();
    await vault10.execute(actuator.address, 0, data10, {
      from: user10,
      nonce: await web3.eth.getTransactionCount(user10),
    });
    await vault11.execute(actuator.address, 0, data11, {
      from: user11,
      nonce: await web3.eth.getTransactionCount(user11),
    });
    await vault12.execute(actuator.address, 0, data12, {
      from: user12,
      nonce: await web3.eth.getTransactionCount(user12),
    });
    await vault13.execute(actuator.address, 0, data13, {
      from: user13,
      nonce: await web3.eth.getTransactionCount(user13),
    });
  });
  describe("BatchMultiSigCall core lib", () => {
    let batchMultiSigCall;

    it("Should get transfer plugin", () => {
      const TransferPlugin = getPlugin({ signature: "transfer(address,uint256)" });

      const transfer = new TransferPlugin.plugin();

      expect(transfer.method).to.eq("transfer");
    });

    it("Should get plugins", () => {
      const plugins = getPlugins({
        by: {
          protocol: "ERC20",
        },
      });

      expect(plugins.length).to.eq(2);
    });

    it("Should add call", async () => {
      batchMultiSigCall = new BatchMultiSigCall({
        provider: ethers.provider,
        contractAddress: fctController.address,
      });

      // Or we can call setOptions to add options
      batchMultiSigCall.setOptions({
        maxGasPrice: "30000000000", // 30 GWei
        cancelable: false,
      });

      // Create an ERC20 Transfer call with plugin
      await batchMultiSigCall.create({
        plugin: new ERC20.actions.Transfer({
          initParams: {
            token: kiro.address,
            to: user1,
            amount: "30000",
          },
        }),
        from: vault11.address,
        options: {
          flow: Flow.OK_CONT_FAIL_CONT,
          jumpOnSuccess: 1,
          jumpOnFail: 0,
        },
      });

      // Test with a validator call
      await batchMultiSigCall.create({
        to: kiro.address,
        method: "balanceof",
        params: [{ name: "owner", type: "address", value: vault10.address }],
        validator: {
          validatorAddress: validator.address,
          method: "greaterThan",
          params: {
            valueToCompare: "10",
          },
        },
        from: vault10.address,
      });

      // Or create ERC20 Transfer call without plugin
      await batchMultiSigCall.create({
        to: kiro.address,
        toENS: "@token.kiro.eth",
        method: "transfer",
        params: [
          { name: "to", type: "address", value: accounts[12] },
          { name: "token_amount", type: "uint256", value: "20" },
        ],
        from: vault10.address,
      });

      // Create an ERC20 balanceOf getter call (create function always returns all the added calls)
      const calls = await batchMultiSigCall.create({
        plugin: new ERC20.getters.BalanceOf({
          initParams: {
            token: kiro.address,
            owner: vault10.address,
          },
        }),
        from: vault10.address,
      });

      console.log(util.inspect(calls, false, null, true));

      expect(calls.length).to.be.equal(4);
    });

    // it("Should getAllPlugins", async () => {
    //   // Here we get a list of all available plugins
    //   const plugins = batchMultiSigCall.getAllPlugins();
    //   expect(plugins).to.be.instanceOf(Array);
    // });

    // it("Should return plugin from MSCall", async () => {
    //   // Here we get plugin from already created FCT call
    //   const FCT = await batchMultiSigCall.exportFCT();
    //   const call = FCT.mcall[0];

    //   const { plugin } = await batchMultiSigCall.getPlugin(call);

    //   // expect(plugin).to.be.instanceOf(ERC20.actions.Transfer);
    // });

    it("Should create a variable and add a call from it", async () => {
      // Here we create a variable and add a call
      batchMultiSigCall.createVariable("receiver", accounts[12]);

      // Create call
      const calls = await batchMultiSigCall.create({
        to: kiro.address,
        method: "transfer",
        params: [
          { name: "to", type: "address", value: batchMultiSigCall.getVariableValue("receiver") },
          { name: "token_amount", type: "uint256", value: "20" },
        ],
        from: vault10.address,
      });

      expect(calls.length).to.be.equal(5);
    });

    it("Should import fct", async () => {
      const batchMultiSigCall3 = new BatchMultiSigCall({
        provider: ethers.provider,
        contractAddress: fctController.address,
      });

      await batchMultiSigCall3.create({
        plugin: new ERC20.actions.Transfer({
          initParams: {
            token: kiro.address,
            to: user1,
            amount: "30000",
          },
        }),
        from: vault11.address,
      });

      const batchMultiSigCall2 = new BatchMultiSigCall({
        provider: ethers.provider,
        // contractAddress: fctController.address,
        contractAddress: "0x0bBb48Cd5aCF40622965F83d9dF13cAbCE525a31",
      });

      const FCT = await batchMultiSigCall3.exportFCT();
      const calls = await batchMultiSigCall2.importFCT(FCT);

      console.log(util.inspect(calls, false, null, true));

      expect(calls.length).to.be.equal(1);
    });

    it("Should execute batch", async () => {
      // Here I get object with typedData, typeHash, sessionId, nameHash and mcall array (MSCall[])
      // I can use this object to create a signature
      const FCT = await batchMultiSigCall.exportFCT();

      const signer = getSigner(10);
      const signer2 = getSigner(11);

      const buildActivateId = async () => {
        const version = "010101";
        const nonce = BigInt(await actuator.s_nonces(batchMultiSigSelector + version.slice(0, 2).padEnd(56, "0")));
        return "0x" + version + "0".repeat(34) + (nonce + BigInt("1")).toString(16).padStart(16, "0") + "0".repeat(8);
      };

      // Signing the FCT with 2 signers
      const signedCalls = [FCT].map((item) => {
        const messageDigest = TypedDataUtils.encodeDigest(item.typedData);

        const getSignature = (messageDigest, signer) => {
          console.log("signer", signer);
          const signingKey = new ethers.utils.SigningKey(getPrivateKey(signer));
          let signature = signingKey.signDigest(messageDigest);
          signature.v = "0x" + signature.v.toString(16);

          return signature;
        };

        const signatures = [signer, signer2].map((item) => getSignature(messageDigest, item));
        return {
          ...item,
          signatures,
          variables: batchMultiSigCall.getVariablesAsBytes32(),
          // builder: ZERO_ADDRESS,
          externalSigners: [],
        };
      });

      console.log("Signers", signer, signer2);

      // Creating callData
      const callData = fctBatchMultiSig.contract.methods
        .batchMultiSigCall(await buildActivateId(), signedCalls, [])
        .encodeABI();

      try {
        const res = await actuator.activate(callData, { from: user1 });
        console.log(res);
      } catch (err) {
        console.log(err);
      }

      //   expect(res).to.have.a.property("tx");
      //   expect(res).to.have.a.property("receipt");
    });
  });
});
