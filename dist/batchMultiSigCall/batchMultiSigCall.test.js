"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const chai_1 = require("chai");
const ethers_1 = require("ethers");
const ki_eth_fct_provider_ts_1 = require("@kirobo/ki-eth-fct-provider-ts");
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
    it("Should create a simple call", async () => {
        const calls = await batchMultiSigCall.create({
            to: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
            from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
            value: "5000000000000",
        });
        (0, chai_1.expect)(calls.length).to.eq(1);
    });
    it("Should create a call with params and outputIndex", async () => {
        // create balanceOf call
        await batchMultiSigCall.create({
            to: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
            from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
            method: "balanceOf",
            viewOnly: true,
            params: [
                {
                    name: "owner",
                    type: "address",
                    value: "0x4f631612941F710db646B8290dB097bFB8657dC2",
                },
            ],
        });
        // Create transfer call with outputIndex to balanceOf call
        await batchMultiSigCall.create({
            to: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
            from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
            method: "transfer",
            params: [
                {
                    name: "recipient",
                    type: "address",
                    value: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
                },
                {
                    name: "amount",
                    type: "uint256",
                    outputIndex: 0,
                },
            ],
        });
        const FCT = await batchMultiSigCall.exportFCT();
        (0, chai_1.expect)(FCT.typedData.message["transaction_2"].amount).to.eq("0xFD00000000000000000000000000000000000001");
    });
    it("Should create a call with plugin", async () => {
        batchMultiSigCall = new index_1.BatchMultiSigCall({
            contractAddress,
            provider,
        });
        // create balanceOf call
        await batchMultiSigCall.create({
            to: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
            from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
            method: "balanceOf",
            viewOnly: true,
            params: [
                {
                    name: "owner",
                    type: "address",
                    value: "0x4f631612941F710db646B8290dB097bFB8657dC2",
                },
            ],
        });
        // Create plugin
        const transfer = new ki_eth_fct_provider_ts_1.ERC20.actions.Transfer();
        // Set to input
        await transfer.input.set({
            to: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
            methodParams: {
                recipient: "0x27422B75008CB79Cf0d094f81DE854608eeA36b7",
            },
        });
        // Set amount input as output from call at index 0
        transfer.input.params.methodParams.amount.setOutputVariable({ outputIndex: 0, innerIndex: 0 });
        // Create call with plugin
        await batchMultiSigCall.create({
            plugin: transfer,
            from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        });
        // Export FCT
        const FCT = await batchMultiSigCall.exportFCT();
        (0, chai_1.expect)(FCT.typedData.message["transaction_2"].amount).to.eq("0xFD00000000000000000000000000000000000001");
    });
});
