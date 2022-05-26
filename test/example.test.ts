import { ethers } from "hardhat";
import { Signer } from "ethers";
import Web3 from "web3";
import { assert, expect } from "chai";
import { TypedDataUtils } from "ethers-eip712";
import { BatchTransfer } from "../src";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("FactoryProxy", function () {
  const web3 = new Web3();
  let instance;
  let multiSig;
  let factory;
  let factoryProxy;
  let token20;
  let token20notSafe;
  let token721;
  let oracle;
  let DOMAIN_SEPARATOR;
  let accounts = [];
  let factoryOwner1;
  let factoryOwner2;
  let factoryOwner3;
  let owner;
  let user1;
  let user2;
  let user3;
  let operator;
  let user4;
  let activator;
  let activatorContract;
  let instances = [];
  let FACTORY_DOMAIN_SEPARATOR;

  const val1 = web3.utils.toWei("0.5", "gwei");
  const val2 = web3.utils.toWei("0.4", "gwei");
  const val3 = web3.utils.toWei("0.6", "gwei");
  const valBN = web3.utils.toBN(val1).add(web3.utils.toBN(val2)).add(web3.utils.toBN(val3));

  const userCount = 2;

  // before("setup contract for the test", async () => {
  //   accounts = await ethers.getSigners();

  //   factoryOwner1 = accounts[0];
  //   factoryOwner2 = accounts[1];
  //   factoryOwner3 = accounts[2];
  //   owner = accounts[3];
  //   user1 = accounts[4];
  //   user2 = accounts[5];
  //   user3 = accounts[6];
  //   operator = accounts[7];
  //   user4 = accounts[8];
  //   activator = accounts[7];
  //   instances = [];

  //   const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
  //   const WalletCore = await ethers.getContractFactory("RecoveryWalletCore");
  //   const Wallet = await ethers.getContractFactory("RecoveryWallet");
  //   const Oracle = await ethers.getContractFactory("RecoveryOracle");
  //   const Activator = await ethers.getContractFactory("Activator");
  //   const Factory = await ethers.getContractFactory("Factory");
  //   const FactoryProxy = await ethers.getContractFactory("FactoryProxy");
  //   const FactoryProxy_ = await ethers.getContractFactory("FactoryProxy_");
  //   const ERC20Token = await ethers.getContractFactory("ERC20Token");
  //   const ERC721Token = await ethers.getContractFactory("ERC721Token");

  //   // Creat multi sig wallet
  //   multiSig = await MultiSigWallet.deploy(factoryOwner1.address, factoryOwner2.address, factoryOwner3.address);

  //   // Create factory contracts
  //   const sw_factory = await Factory.connect(owner).deploy();
  //   const sw_factory_proxy = await FactoryProxy.connect(owner).deploy(ZERO_ADDRESS);

  //   // Set target for proxies
  //   const sw_factory_proxy__ = await FactoryProxy_.connect(owner).deploy();
  //   await sw_factory_proxy.connect(owner).setTarget(sw_factory_proxy__.address);
  //   const sw_factory_proxy_ = FactoryProxy_.attach(sw_factory_proxy.address);
  //   await sw_factory_proxy_.connect(owner).setTarget_(sw_factory.address);

  //   // Transfer ownership to multisig wallet
  //   await sw_factory_proxy_.connect(owner).transferOwnership(multiSig.address);

  //   await multiSig.connect(factoryOwner1).setOwnTarget_(sw_factory_proxy_.address);
  //   await multiSig.connect(factoryOwner2).setOwnTarget_(sw_factory_proxy_.address);

  //   const sw_factory_proxy_ms = FactoryProxy_.attach(multiSig.address);

  //   await sw_factory_proxy_ms.connect(factoryOwner2).setTarget_(sw_factory.address);
  //   await sw_factory_proxy_ms.connect(factoryOwner3).setTarget_(sw_factory.address);

  //   factory = Factory.attach(sw_factory_proxy.address);
  //   factoryProxy = FactoryProxy_.attach(sw_factory_proxy__.address);

  //   const core = await WalletCore.connect(factoryOwner3).deploy();
  //   const version = await Wallet.connect(factoryOwner3).deploy(core.address, ZERO_ADDRESS);
  //   token20 = await ERC20Token.connect(owner).deploy("Kirobo ERC20 Token", "KDB20");
  //   activatorContract = await Activator.connect(owner).deploy(token20.address, sw_factory_proxy.address);
  //   oracle = await Oracle.connect(owner).deploy(activatorContract.address);
  //   const createFee = 1000;

  //   await activatorContract.connect(owner).setBackupFees(createFee);
  //   await activatorContract.connect(owner).setInheritanceFees(createFee);
  //   await activatorContract.connect(owner).setTokenInheritanceFees(createFee);

  //   await multiSig.connect(factoryOwner1).setOwnTarget_(factory.address);
  //   await multiSig.connect(factoryOwner3).setOwnTarget_(factory.address);

  //   const factory_ms = Factory.attach(multiSig.address);

  //   await factory_ms.connect(factoryOwner1).addVersion(version.address, oracle.address);
  //   await factory_ms.connect(factoryOwner2).addVersion(version.address, oracle.address);
  //   await factory_ms.connect(factoryOwner1).deployVersion(await version.version());
  //   await factory_ms.connect(factoryOwner2).deployVersion(await version.version());
  //   await factory.connect(owner).createWallet(false);
  //   const tx = await factory.connect(owner).createWallet(false);
  //   console.log("Wallet created");
  //   instance = Wallet.attach(await factory.getWallet(owner.address));

  //   await oracle.connect(owner).update721(token20.address, true);
  //   await oracle.connect(owner).update20(token20.address, true);
  //   token20notSafe = await ERC20Token.connect(owner).deploy("Kirobo ERC20 Not Safe Token", "KDB20NS");
  //   token721 = await ERC721Token.connect(owner).deploy("Kirobo ERC721 Token", "KBF");

  //   await multiSig.connect(factoryOwner1).setOwnTarget_(sw_factory_proxy.address);
  //   await multiSig.connect(factoryOwner2).setOwnTarget_(sw_factory_proxy.address);

  //   await sw_factory_proxy_ms.connect(factoryOwner2).setActivator_(activator.address);
  //   await sw_factory_proxy_ms.connect(factoryOwner3).setActivator_(activator.address);

  //   await sw_factory_proxy_ms.connect(factoryOwner1).setLocalEns_("token.kiro.eth", token20.address);
  //   await sw_factory_proxy_ms.connect(factoryOwner3).setLocalEns_("token.kiro.eth", token20.address);

  //   FACTORY_DOMAIN_SEPARATOR = await factoryProxy.DOMAIN_SEPARATOR();

  //   DOMAIN_SEPARATOR = await instance.DOMAIN_SEPARATOR();
  // });

  before("Setup contracts", async () => {
    accounts = await ethers.getSigners();
    factoryOwner1 = accounts[0];
    factoryOwner2 = accounts[1];
    factoryOwner3 = accounts[2];
    owner = accounts[3];
    user1 = accounts[4];
    user2 = accounts[5];
    user3 = accounts[6];
    operator = accounts[7];
    user4 = accounts[8];
    activator = accounts[7];
    instances = [];

    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const WalletCore = await ethers.getContractFactory("RecoveryWalletCore");
    const Wallet = await ethers.getContractFactory("RecoveryWallet");
    const Oracle = await ethers.getContractFactory("RecoveryOracle");
    const Activator = await ethers.getContractFactory("Activator");
    const Factory = await ethers.getContractFactory("Factory");
    const FactoryProxy = await ethers.getContractFactory("FactoryProxy");
    const FactoryProxy_ = await ethers.getContractFactory("FactoryProxy_");
    const ERC20Token = await ethers.getContractFactory("ERC20Token");
    const ERC721Token = await ethers.getContractFactory("ERC721Token");

    // Create factory contracts
    const sw_factory = await Factory.connect(owner).deploy();
    const sw_factory_proxy = await FactoryProxy.connect(owner).deploy(ZERO_ADDRESS);
    const sw_factory_proxy__ = await FactoryProxy_.connect(owner).deploy();

    await sw_factory_proxy.connect(owner).setTarget(sw_factory_proxy__.address);
    const sw_factory_proxy_ = FactoryProxy_.attach(sw_factory_proxy.address);
    await sw_factory_proxy_.connect(owner).setTarget_(sw_factory.address);

    factory = Factory.attach(sw_factory_proxy.address);
    factoryProxy = FactoryProxy_.attach(sw_factory_proxy_.address);

    const core = await WalletCore.connect(owner).deploy();
    const version = await Wallet.connect(owner).deploy(core.address, ZERO_ADDRESS);
    token20 = await ERC20Token.connect(owner).deploy("Kirobo ERC20 Token", "KDB20");
    activatorContract = await Activator.connect(owner).deploy(token20.address, sw_factory_proxy.address);
    oracle = await Oracle.connect(owner).deploy(activatorContract.address);
    const createFee = 1000;

    await activatorContract.connect(owner).setBackupFees(createFee);
    await activatorContract.connect(owner).setInheritanceFees(createFee);
    await activatorContract.connect(owner).setTokenInheritanceFees(createFee);

    await factory.connect(owner).addVersion(version.address, oracle.address);
    await factory.connect(owner).deployVersion(await version.version());
    await factory.connect(owner).createWallet(false);
    instance = Wallet.attach(await factory.getWallet(owner.address));

    await oracle.connect(owner).update721(token20.address, true);
    await oracle.connect(owner).update20(token20.address, true);

    token20notSafe = await ERC20Token.connect(owner).deploy("Kirobo ERC20 Not Safe Token", "KDB20NS");
    token721 = await ERC721Token.connect(owner).deploy("Kirobo ERC721 Token", "KBF");

    await sw_factory_proxy_.connect(owner).setActivator_(activator.address);
    await sw_factory_proxy_.connect(owner).setLocalEns_("token.kiro.eth", token20.address);

    FACTORY_DOMAIN_SEPARATOR = await factoryProxy.DOMAIN_SEPARATOR();
    DOMAIN_SEPARATOR = await instance.DOMAIN_SEPARATOR();
  });

  it("Should return uid", async () => {
    const uid = await factoryProxy.uid();
    console.log(uid);
    assert.ok(uid);
  });

  it("should accept ether from everyone", async () => {
    await owner.sendTransaction({ value: val1, to: instance.address });
    await user1.sendTransaction({ value: val1, to: instance.address });
    await user2.sendTransaction({ value: val1, to: instance.address });

    await token20.connect(owner).mint(user1.address, 10000);
    await token20.connect(owner).mint(user2.address, 10000);
    await token20.connect(owner).mint(user3.address, 10000);
    await token20.connect(owner).mint(user4.address, 10000);

    for (let i = 10; i < 10 + userCount; ++i) {
      console.log("minting for", accounts[i].address);
      await token20.connect(owner).mint(accounts[i].address, 10000);
    }
    for (let i = 10; i < 20; ++i) {
      await factory.connect(accounts[i]).createWallet(false);
      instances.push(await factory.getWallet(accounts[i].address));
    }
    for (const instance of instances) {
      await token20.connect(owner).mint(instance, 10000);
      await owner.sendTransaction({ value: val1, to: instance });
    }

    await token20.connect(user1).transfer(instance.address, 5000);
    await token20.connect(user1).transfer(instance.address, 50);
  });

  it("should add tx to batchTransfer calls", async () => {
    const batchTransfer = new BatchTransfer();

    await batchTransfer.addTx(
      {
        token: ZERO_ADDRESS,
        tokenEnsHash: "",
        to: accounts[11].address,
        toEnsHash: "",
        value: 5,
        signer: accounts[10].address,
      },
      accounts[10],
      factoryProxy
    );

    expect(batchTransfer.calls.length).to.eq(1);
  });

  it("should execute batchTransfer", async () => {
    const batchTransfer = new BatchTransfer();

    await batchTransfer.addTx(
      {
        token: token20.address,
        tokenEnsHash: "",
        to: accounts[12].address,
        toEnsHash: "",
        value: 5,
        signer: accounts[10].address,
      },
      accounts[10],
      factoryProxy
    );

    console.log(batchTransfer.calls);

    await batchTransfer.executeWithEthers(factoryProxy, activator, true);
  });
});
