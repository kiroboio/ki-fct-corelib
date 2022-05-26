import { BatchTransfer } from "../src";
import { expect } from "chai";
import ganache, { EthereumProvider, ProviderOptions } from "ganache";
import { Contract, ethers, Wallet } from "ethers";
import "mocha";
import FactoryProxyABI from "./abi/FactoryProxy_.abi.json";
import FactoryProxyMainABI from "./abi/FactoryProxy.abi.json";
import FactoryABI from "./abi/Factory.abi.json";
import Pkeys from "../pkeys.json";
import { JsonRpcSigner, Web3Provider, JsonRpcProvider } from "@ethersproject/providers";
import { TypedDataUtils } from "ethers-eip712";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const mnemonic = "awesome grain neither pond excess garage tackle table piece assist venture escape";
const accounts = 200;

describe("BatchTransfer", () => {
  let signer0: JsonRpcSigner;
  let signer1: JsonRpcSigner;
  let activator: JsonRpcSigner;

  let provider: JsonRpcProvider;
  let factoryProxyMain: Contract;
  let factoryProxy: Contract;
  let factory: Contract;

  before("Prepare ganache server", async () => {
    const options = {
      total_accounts: accounts,
      gasLimit: 22500000,
      chain: {
        chainId: 4,
        networkId: 4,
      },
      default_balance_ether: 1000,
      quiet: true,
      wallet: {
        mnemonic,
      },
    };
    provider = new ethers.providers.Web3Provider(ganache.provider(options));

    signer0 = provider.getSigner(0);
    signer1 = provider.getSigner(1);
    activator = provider.getSigner(7);

    const price = ethers.utils.formatUnits(await provider.getGasPrice(), "gwei");
    const factoryOptions = { gasPrice: ethers.utils.parseUnits(price, "gwei") };

    // Deploy Factory
    const contractFactory = new ethers.ContractFactory(FactoryABI.abi, FactoryABI.bytecode, signer0);
    factory = await contractFactory.deploy(factoryOptions);
    await factory.deployed();

    // Deploy FactoryProxy
    const contractFactoryProxyMain = new ethers.ContractFactory(
      FactoryProxyMainABI.abi,
      FactoryProxyMainABI.bytecode,
      signer0
    );
    factoryProxyMain = await contractFactoryProxyMain.deploy(ZERO_ADDRESS, factoryOptions);
    await factory.deployed();

    // Deploy FactoryProxy_
    const contractFactoryProxy = new ethers.ContractFactory(FactoryProxyABI.abi, FactoryProxyABI.bytecode, signer0);
    factoryProxy = await contractFactoryProxy.deploy(factoryOptions);
    await factoryProxy.deployed();

    await factoryProxyMain.setTarget(factoryProxy.address);
    const factory_proxy_ = factoryProxy.attach(factoryProxyMain.address);
    await factory_proxy_.setTarget_(factory.address);

    await factoryProxy.setActivator_(await activator.getAddress());
  });
  it("Add tx to batchTransfer calls array", async () => {
    const batchTransfer = new BatchTransfer();
    const wallet = new Wallet(Pkeys[10]);

    await batchTransfer.addTx(
      {
        token: ZERO_ADDRESS,
        tokenEnsHash: "",
        to: await provider.getSigner(12).getAddress(),
        toEnsHash: "",
        value: "10",
        signer: wallet.address,
        cancelable: false,
        payable: true,
      },
      wallet,
      factoryProxy
    );

    console.log(batchTransfer.calls);

    await batchTransfer.executeWithEthers(factoryProxy, activator, false);

    expect(batchTransfer.calls.length).to.eq(1);
  });
});
