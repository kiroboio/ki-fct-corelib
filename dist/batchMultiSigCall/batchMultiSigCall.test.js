"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const ethers_1 = require("ethers");
const ki_eth_fct_provider_ts_1 = require("@kirobo/ki-eth-fct-provider-ts");
const chai_1 = require("chai");
const utils_1 = __importDefault(require("../utils"));
const variables_1 = __importDefault(require("../variables"));
const contractAddress = "0xD614c22fb35d1d978053d42C998d0493f06FB440";
const provider = new ethers_1.ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");
describe("BatchMultiSigCall", () => {
    let batchMultiSigCall;
    beforeEach(async () => {
        batchMultiSigCall = new index_1.BatchMultiSigCall({
            contractAddress,
            provider,
        });
    });
    it("Should create simple ERC20 Transfer FCT", async () => {
        const transfer = new ki_eth_fct_provider_ts_1.ERC20.actions.Transfer({
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
        (0, chai_1.expect)(calls).to.be.an("array");
        const FCT = await batchMultiSigCall.exportFCT();
        (0, chai_1.expect)(FCT).to.be.an("object");
        (0, chai_1.expect)(FCT.typedData.message["transaction_1"].recipient).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
        (0, chai_1.expect)(FCT.typedData.message["transaction_1"].amount).to.eq("1000000000000000000");
    });
    it("Should create ERC20 Transfer, ERC20 Balance Of and Aave V2 deposit FCT", async () => {
        const plugins = (0, ki_eth_fct_provider_ts_1.getPlugins)({});
        const AaveDeposit = plugins.find((p) => p.name === "AAVE_deposit");
        const transfer = new ki_eth_fct_provider_ts_1.ERC20.actions.Transfer({
            initParams: {
                to: "0xfeab457d95d9990b7eb6c943c839258245541754",
                methodParams: {
                    amount: "1000000000000000000",
                    recipient: "0x4f631612941F710db646B8290dB097bFB8657dC2",
                },
            },
        });
        const balanceOf = new ki_eth_fct_provider_ts_1.ERC20.getters.BalanceOf({
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
        (0, chai_1.expect)(calls).to.be.an("array");
        const FCT = await batchMultiSigCall.exportFCT();
        (0, chai_1.expect)(FCT).to.be.an("object");
        (0, chai_1.expect)(FCT.typedData.message["transaction_1"].recipient).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
        (0, chai_1.expect)(FCT.typedData.message["transaction_1"].amount).to.eq("1000000000000000000");
        (0, chai_1.expect)(FCT.typedData.message["transaction_2"].owner).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
        (0, chai_1.expect)(FCT.typedData.message["transaction_3"].asset).to.eq("0x6B175474E89094C44Da98b954EedeAC495271d0F");
        (0, chai_1.expect)(FCT.typedData.message["transaction_3"].amount).to.eq("1000000000000000000");
        (0, chai_1.expect)(FCT.typedData.message["transaction_3"].onBehalfOf).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
    });
    it("Should...", async () => {
        batchMultiSigCall = new index_1.BatchMultiSigCall({
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
            {
                nodeId: "node2",
                to: variables_1.default.useMinerAddress(),
                from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
                method: "transfer",
                params: [
                    { name: "recipient", type: "address", value: "0x4f631612941F710db646B8290dB097bFB8657dC2" },
                    { name: "amount", type: "uint256", value: "100" },
                ],
            },
        ]);
        const variablesArray = ["1", "2"];
        const variablesAsBytes32 = utils_1.default.getVariablesAsBytes32(variablesArray);
        const FCT = await batchMultiSigCall.exportFCT();
    });
});
