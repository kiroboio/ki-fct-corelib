"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CALL_OPTIONS = exports.NO_JUMP = exports.EIP712_MULTISIG = exports.EIP712_RECURRENCY = exports.addresses = void 0;
const flows_1 = require("../constants/flows");
exports.addresses = {
    1: {
        // NOTE: These addresses are not correct since no contracts have been deployed on mainnet
        // TODO: Update these addresses once contracts have been deployed on mainnet
        FCT_Controller: "0x087550a787B2720AAC06351065afC1F413D82572",
        FCT_BatchMultiSig: "0x067D176d13651c8AfF7964a4bB9dF3107F893e88",
        FCT_EnsManager: "0x7DA33a8606BF2F752D473238ff8681b53cf30976",
        FCT_Tokenomics: "0xFE4fEC781Bd626751249ABb1b15375f3370B9c79",
        Actuator: "0x6B271aEa169B4804D1d709B2687c17c3Cc8E2e56",
        ActuatorCore: "0xC76b674d3e33cd908055F295c945F1cd575b7df2",
    },
    5: {
        FCT_Controller: "0x087550a787B2720AAC06351065afC1F413D82572",
        FCT_BatchMultiSig: "0x067D176d13651c8AfF7964a4bB9dF3107F893e88",
        FCT_EnsManager: "0x7DA33a8606BF2F752D473238ff8681b53cf30976",
        FCT_Tokenomics: "0xFE4fEC781Bd626751249ABb1b15375f3370B9c79",
        Actuator: "0x6B271aEa169B4804D1d709B2687c17c3Cc8E2e56",
        ActuatorCore: "0xC76b674d3e33cd908055F295c945F1cd575b7df2",
    },
};
exports.EIP712_RECURRENCY = [
    { name: "max_repeats", type: "uint16" },
    { name: "chill_time", type: "uint32" },
    { name: "accumetable", type: "bool" },
];
exports.EIP712_MULTISIG = [
    { name: "external_signers", type: "address[]" },
    { name: "minimum_approvals", type: "uint8" },
];
exports.NO_JUMP = "NO_JUMP";
exports.DEFAULT_CALL_OPTIONS = {
    permissions: "0000",
    gasLimit: "0",
    flow: flows_1.Flow.OK_CONT_FAIL_REVERT,
    jumpOnSuccess: exports.NO_JUMP,
    jumpOnFail: exports.NO_JUMP,
    falseMeansFail: false,
    callType: "ACTION",
};
