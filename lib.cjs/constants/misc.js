"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCT_VAULT_ADDRESS = exports.CALL_TYPE_MSG_REV = exports.CALL_TYPE_MSG = exports.CALL_TYPE = exports.ValidationOperator = exports.ValidationBase = exports.ComputedBaseBytes32 = exports.ComputedBaseAddress = exports.BackOutputVariableBaseBytes32 = exports.BackOutputVariableBaseAddress = exports.OutputVariableBaseBytes32 = exports.OutputVariableBaseAddress = exports.ExternalVariableBaseBytes32 = exports.ExternalVariableBaseAddress = exports.EMPTY_HASH = exports.multicallContracts = void 0;
const ethers_1 = require("ethers");
const { keccak256, toUtf8Bytes } = ethers_1.ethers.utils;
exports.multicallContracts = {
    1: "0xcA11bde05977b3631167028862bE2a173976CA11",
    42161: "0xcA11bde05977b3631167028862bE2a173976CA11",
    10: "0xcA11bde05977b3631167028862bE2a173976CA11",
    8453: "0xcA11bde05977b3631167028862bE2a173976CA11",
    //
    // Testnets
    11155111: "0xcA11bde05977b3631167028862bE2a173976CA11",
    5: "0xcA11bde05977b3631167028862bE2a173976CA11",
    421613: "0xcA11bde05977b3631167028862bE2a173976CA11",
};
exports.EMPTY_HASH = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";
exports.ExternalVariableBaseAddress = "0xFC00000000000000000000000000000000000000";
exports.ExternalVariableBaseBytes32 = "0xFC00000000000000000000000000000000000000000000000000000000000000";
exports.OutputVariableBaseAddress = "0xFD00000000000000000000000000000000000000";
exports.OutputVariableBaseBytes32 = "0xFD00000000000000000000000000000000000000000000000000000000000000";
exports.BackOutputVariableBaseAddress = "0xFDB0000000000000000000000000000000000000";
exports.BackOutputVariableBaseBytes32 = "0xFDB0000000000000000000000000000000000000000000000000000000000000";
exports.ComputedBaseAddress = "0xFE00000000000000000000000000000000000000";
exports.ComputedBaseBytes32 = "0xFE00000000000000000000000000000000000000000000000000000000000000";
exports.ValidationBase = "0xE900000000000000000000000000000000000000000000000000000000000000";
exports.ValidationOperator = {
    equal: keccak256(toUtf8Bytes("equal")),
    "not equal": keccak256(toUtf8Bytes("not equal")),
    "greater than": keccak256(toUtf8Bytes("greater than")),
    "greater equal than": keccak256(toUtf8Bytes("greater equal than")),
    or: keccak256(toUtf8Bytes("or")),
    "or not": keccak256(toUtf8Bytes("or not")),
    and: keccak256(toUtf8Bytes("and")),
    "and not": keccak256(toUtf8Bytes("and not")),
};
exports.CALL_TYPE = {
    ACTION: "0",
    VIEW_ONLY: "1",
    LIBRARY: "2",
    LIBRARY_VIEW_ONLY: "3",
};
exports.CALL_TYPE_MSG = {
    ACTION: "action",
    VIEW_ONLY: "view only",
    LIBRARY: "library: action",
    LIBRARY_VIEW_ONLY: "library: view only",
};
// Reverse Call Type MSG
exports.CALL_TYPE_MSG_REV = {
    action: "ACTION",
    "view only": "VIEW_ONLY",
    "library: action": "LIBRARY",
    "library: view only": "LIBRARY_VIEW_ONLY",
};
exports.FCT_VAULT_ADDRESS = "FCT_VAULT_ADDRESS";
//# sourceMappingURL=misc.js.map