"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.freshTestFCT = exports.buildTestFCT = exports.TestFCT = void 0;
const ki_eth_fct_provider_ts_1 = require("@kirobo/ki-eth-fct-provider-ts");
const ethers_1 = require("ethers");
const batchMultiSigCall_1 = require("../batchMultiSigCall");
const FCT_json_1 = __importDefault(require("./FCT.json"));
const USDC = {
    1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    5: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
};
exports.TestFCT = FCT_json_1.default;
const buildTestFCT = () => {
    const FCT = batchMultiSigCall_1.BatchMultiSigCall.from(exports.TestFCT);
    return { FCT, FCTJson: exports.TestFCT };
};
exports.buildTestFCT = buildTestFCT;
const freshTestFCT = async ({ chainId }) => {
    const FCT = new batchMultiSigCall_1.BatchMultiSigCall({
        chainId,
    });
    // Create ERC20 Transfer
    const transfer = new ki_eth_fct_provider_ts_1.ERC20.actions.Transfer({
        chainId,
        initParams: {
            to: USDC[chainId],
            methodParams: {
                amount: ethers_1.ethers.utils.parseUnits("1", 6).toString(),
                recipient: "0x62e3A53A947D34C4DdCD67B49fAdc30b643e2586",
            },
        },
    });
    return { FCT, FCTJson: exports.TestFCT };
};
exports.freshTestFCT = freshTestFCT;
