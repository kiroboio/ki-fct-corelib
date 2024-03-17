"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCT_VAULT_ADDRESS = exports.CALL_TYPE_MSG_REV = exports.CALL_TYPE_MSG = exports.CALL_TYPE = exports.ValidationOperator = exports.ValidationBase = exports.ComputedBaseBytes = exports.ComputedBase = exports.FDBackBaseBytes = exports.FDBackBase = exports.FDBaseBytes = exports.FDBase = exports.FCBaseBytes = exports.FCBase = exports.nullValue = exports.multicallContracts = void 0;
const ethers_1 = require("ethers");
const { keccak256, toUtf8Bytes } = ethers_1.ethers.utils;
exports.multicallContracts = {
    1: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
    5: "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696",
    42161: "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696",
    421613: "0x961E16D26D3f1fc042F192a2e5054120938c1CD5",
};
exports.nullValue = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";
exports.FCBase = "0xFC00000000000000000000000000000000000000";
exports.FCBaseBytes = "0xFC00000000000000000000000000000000000000000000000000000000000000";
exports.FDBase = "0xFD00000000000000000000000000000000000000";
exports.FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";
exports.FDBackBase = "0xFDB0000000000000000000000000000000000000";
exports.FDBackBaseBytes = "0xFDB0000000000000000000000000000000000000000000000000000000000000";
exports.ComputedBase = "0xFE00000000000000000000000000000000000000";
exports.ComputedBaseBytes = "0xFE00000000000000000000000000000000000000000000000000000000000000";
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