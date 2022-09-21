import { BatchMultiSigCall } from "./index";
import { ethers } from "ethers";
import { ERC20, getPlugins } from "@kirobo/ki-eth-fct-provider-ts";
import { expect } from "chai";
import utils from "../utils";

const contractAddress = "0xD614c22fb35d1d978053d42C998d0493f06FB440";
const provider = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");

describe("BatchMultiSigCall", () => {
  let batchMultiSigCall: BatchMultiSigCall;

  beforeEach(async () => {
    batchMultiSigCall = new BatchMultiSigCall({
      contractAddress,
      provider,
    });
  });

  it("Should create simple ERC20 Transfer FCT", async () => {
    const transfer = new ERC20.actions.Transfer({
      initParams: {
        to: "0xfeab457d95d9990b7eb6c943c839258245541754",
        methodParams: {
          amount: "1000000000000000000",
          recipient: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        },
      },
    });

    const calls = await batchMultiSigCall.create({
      nodeId: "node1",
      plugin: transfer,
      from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
    });

    expect(calls).to.be.an("array");

    const FCT = await batchMultiSigCall.exportFCT();

    expect(FCT).to.be.an("object");
    expect(FCT.typedData.message["transaction_1"].recipient).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
    expect(FCT.typedData.message["transaction_1"].amount).to.eq("1000000000000000000");
  });

  it("Should create ERC20 Transfer, ERC20 Balance Of and Aave V2 deposit FCT", async () => {
    const plugins = getPlugins({});

    const AaveDeposit = plugins.find((p) => p.name === "AAVE_deposit");

    const transfer = new ERC20.actions.Transfer({
      initParams: {
        to: "0xfeab457d95d9990b7eb6c943c839258245541754",
        methodParams: {
          amount: "1000000000000000000",
          recipient: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        },
      },
    });

    const balanceOf = new ERC20.getters.BalanceOf({
      initParams: {
        to: "0xfeab457d95d9990b7eb6c943c839258245541754",
        methodParams: {
          owner: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        },
      },
    });

    const deposit = new AaveDeposit.plugin({
      initParams: {
        to: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
        methodParams: {
          asset: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          amount: "1000000000000000000",
          onBehalfOf: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          referralCode: "0",
        },
      },
    });

    const calls = await batchMultiSigCall.createMultiple([
      {
        nodeId: "node1",
        plugin: transfer,
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
      },
      {
        nodeId: "node2",
        plugin: balanceOf,
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
      },
      {
        nodeId: "node3",
        plugin: deposit,
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
      },
    ]);

    expect(calls).to.be.an("array");

    const FCT = await batchMultiSigCall.exportFCT();

    expect(FCT).to.be.an("object");

    expect(FCT.typedData.message["transaction_1"].recipient).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
    expect(FCT.typedData.message["transaction_1"].amount).to.eq("1000000000000000000");

    expect(FCT.typedData.message["transaction_2"].owner).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");

    expect(FCT.typedData.message["transaction_3"].asset).to.eq("0x6B175474E89094C44Da98b954EedeAC495271d0F");
    expect(FCT.typedData.message["transaction_3"].amount).to.eq("1000000000000000000");
    expect(FCT.typedData.message["transaction_3"].onBehalfOf).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
  });

  it("Should...", async () => {
    batchMultiSigCall = new BatchMultiSigCall({
      contractAddress,
      provider,
    });

    const calls = await batchMultiSigCall.createMultiple([
      {
        nodeId: "node1",
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        method: "balanceOf",
        params: [{ name: "recipient", type: "address", value: "0x4f631612941F710db646B8290dB097bFB8657dC2" }],
      },
      {
        nodeId: "node2",
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        method: "transfer",
        params: [
          { name: "recipient", type: "address", value: "0x4f631612941F710db646B8290dB097bFB8657dC2" },
          { name: "amount", type: "uint256", variable: { type: "output", id: { nodeId: "node1", innerIndex: 0 } } },
        ],
      },
    ]);

    const variables = ["1", "2"];

    const variablesAsBytes32 = utils.getVariablesAsBytes32(variables);

    const FCT = await batchMultiSigCall.exportFCT();
  });
});
