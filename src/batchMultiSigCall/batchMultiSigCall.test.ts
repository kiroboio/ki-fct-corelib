import { BatchMultiSigCall } from "./index";
import { ethers } from "ethers";
import { AaveV2, ERC20 } from "@kirobo/ki-eth-fct-provider-ts";
import { expect } from "chai";
import { Flow } from "../constants";

const contractAddress = "0xE215Fe5f574593A034c7E6e9BE280A254D02F4dd";
const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.public.blastapi.io");

function getDate(days: number = 0) {
  const result = new Date();
  result.setDate(result.getDate() + days);
  return Number(result.getTime() / 1000).toFixed();
}

describe("BatchMultiSigCall", () => {
  let batchMultiSigCall: BatchMultiSigCall;

  beforeEach(async () => {
    batchMultiSigCall = new BatchMultiSigCall({
      contractAddress,
      provider,
    });
  });

  it("Should set settings", async () => {
    const maxGasPriceErrorSettings = {
      maxGasPrice: "0",
    };

    expect(() => batchMultiSigCall.setOptions(maxGasPriceErrorSettings)).to.throw("Max gas price cannot be 0 or less");

    const expiresAtErrorSettings = {
      expiresAt: "0",
    };

    expect(() => batchMultiSigCall.setOptions(expiresAtErrorSettings)).to.throw("Expires at must be in the future");

    const validSettings = {
      maxGasPrice: "100000000000",
      expiresAt: getDate(1),
    };

    expect(batchMultiSigCall.setOptions(validSettings)).to.be.an("object");
  });

  it("Should create simple ERC20 Transfer FCT", async () => {
    const transfer = new ERC20.actions.Transfer({
      chainId: 5,
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
    const balanceOf = new ERC20.getters.BalanceOf({
      chainId: 5,
      initParams: {
        to: "0xfeab457d95d9990b7eb6c943c839258245541754",
        methodParams: {
          owner: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        },
      },
    });

    const deposit = new AaveV2.actions.Deposit({
      chainId: 5,
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
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        toENS: "@token.kiro.eth",
        method: "transfer",
        params: [
          { name: "recipient", type: "address", value: "0x4f631612941F710db646B8290dB097bFB8657dC2" },
          { name: "amount", type: "uint256", value: "20" },
        ],
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        options: {
          flow: Flow.OK_CONT_FAIL_CONT,
          jumpOnFail: "node3",
        },
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
    expect(FCT.typedData.message["transaction_1"].amount).to.eq("20");
    expect(FCT.typedData.message["transaction_1"].call.jump_on_fail).to.eq(2);

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
        options: {
          jumpOnSuccess: "node3",
          jumpOnFail: "node2",
        },
      },
      {
        nodeId: "node2",
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        method: "transfer",
        params: [
          { name: "recipient", type: "address", value: "0x4f631612941F710db646B8290dB097bFB8657dC2" },
          { name: "amount", type: "uint256", value: { type: "output", id: { nodeId: "node1", innerIndex: 0 } } },
        ],
      },
    ]);

    const FCT = await batchMultiSigCall.exportFCT();

    expect(FCT).to.be.an("object");

    expect(FCT.typedData.message["transaction_1"].recipient).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
    expect(FCT.typedData.message["transaction_1"].call.jump_on_success).to.eq(2);
    expect(FCT.typedData.message["transaction_1"].call.jump_on_fail).to.eq(1);

    expect(FCT.typedData.message["transaction_2"].recipient).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
    expect(FCT.typedData.message["transaction_2"].amount).to.eq("0xFD00000000000000000000000000000000000001");

    expect(FCT.typedData.message["transaction_3"].recipient).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
    expect(FCT.typedData.message["transaction_3"].amount).to.eq("100");
  });
});
