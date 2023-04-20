"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCT_VAULT_ADDRESS = exports.CALL_TYPE_MSG_REV = exports.CALL_TYPE_MSG = exports.CALL_TYPE = exports.ComputedBaseBytes = exports.ComputedBase = exports.FDBackBaseBytes = exports.FDBackBase = exports.FDBaseBytes = exports.FDBase = exports.FCBaseBytes = exports.FCBase = exports.nullValue = exports.multicallContracts = void 0;
exports.multicallContracts = {
    1: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
    5: "0x77dCa2C955b15e9dE4dbBCf1246B4B85b651e50e",
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
exports.CALL_TYPE = {
    ACTION: "0",
    VIEW_ONLY: "1",
    LIBRARY: "2",
};
exports.CALL_TYPE_MSG = {
    ACTION: "action",
    VIEW_ONLY: "view only",
    LIBRARY: "library",
};
// Reverse Call Type MSG
exports.CALL_TYPE_MSG_REV = {
    action: "ACTION",
    "view only": "VIEW_ONLY",
    library: "LIBRARY",
};
exports.FCT_VAULT_ADDRESS = "FCT_VAULT_ADDRESS";
