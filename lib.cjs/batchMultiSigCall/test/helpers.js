"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.freshTestFCT = exports.buildTestFCT = exports.TestFCT = void 0;
const tslib_1 = require("tslib");
const fct_plugins_1 = require("@kiroboio/fct-plugins");
const batchMultiSigCall_1 = require("../batchMultiSigCall");
const FCT_json_1 = tslib_1.__importDefault(require("./FCT.json"));
const USDC = {
    1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    5: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
    42161: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
    421613: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
};
exports.TestFCT = FCT_json_1.default;
const buildTestFCT = () => {
    const FCT = batchMultiSigCall_1.BatchMultiSigCall.from(exports.TestFCT);
    return { FCT, FCTJson: exports.TestFCT };
};
exports.buildTestFCT = buildTestFCT;
const freshTestFCT = ({ chainId }) => {
    const vault = "0x03357338Ea477FF139170cf85C9A4063dFc03FC9";
    const FCT = new batchMultiSigCall_1.BatchMultiSigCall({
        chainId,
        defaults: {
            from: vault,
        },
    });
    const defaultSettings = {
        validFrom: "0",
        expiresAt: "2680505792",
    };
    FCT.setOptions(defaultSettings);
    const balanceOf = new fct_plugins_1.ERC20.getters.BalanceOf({
        chainId,
        initParams: {
            to: USDC[chainId],
            methodParams: {
                owner: vault,
            },
        },
    });
    const halfOfBalance = new fct_plugins_1.TokensMath.getters.Divide({
        chainId,
        initParams: {
            methodParams: {
                amount1: balanceOf.output.params.balance.getOutputVariable("usdc_balanceOf"),
                amount2: "2",
                decimals1: "0",
                decimals2: "0",
                decimalsOut: "0",
            },
        },
    });
    const transfer = new fct_plugins_1.ERC20.actions.Transfer({
        chainId,
        initParams: {
            to: USDC[chainId],
            methodParams: {
                amount: halfOfBalance.output.params.result.getOutputVariable("usdc_halfOfBalance"),
                recipient: "0x62e3A53A947D34C4DdCD67B49fAdc30b643e2586",
            },
        },
    });
    FCT.createMultiple([
        {
            plugin: balanceOf,
            nodeId: "usdc_balanceOf",
        },
        {
            plugin: halfOfBalance,
            nodeId: "usdc_halfOfBalance",
        },
        {
            plugin: transfer,
            nodeId: "usdc_transfer",
        },
    ]);
    return FCT;
};
exports.freshTestFCT = freshTestFCT;
//# sourceMappingURL=helpers.js.map