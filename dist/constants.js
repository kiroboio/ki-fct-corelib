"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Flow = void 0;
var Flow;
(function (Flow) {
    Flow["OK_CONT_FAIL_REVERT"] = "OK_CONT_FAIL_REVERT";
    Flow["OK_CONT_FAIL_STOP"] = "OK_CONT_FAIL_STOP";
    Flow["OK_CONT_FAIL_CONT"] = "OK_CONT_FAIL_CONT";
    Flow["OK_REVERT_FAIL_CONT"] = "OK_REVERT_FAIL_CONT";
    Flow["OK_REVERT_FAIL_STOP"] = "OK_REVERT_FAIL_STOP";
    Flow["OK_STOP_FAIL_CONT"] = "OK_STOP_FAIL_CONT";
    Flow["OK_STOP_FAIL_REVERT"] = "OK_STOP_FAIL_REVERT";
})(Flow = exports.Flow || (exports.Flow = {}));
const BLOCK_NUMBER = "0xFB0A000000000000000000000000000000000000";
const BLOCK_TIMESTAMP = "0xFB0B000000000000000000000000000000000000";
const GAS_PRICE = "0xFB0C000000000000000000000000000000000000";
const MINER_ADDRESS = "0xFA0A000000000000000000000000000000000000";
const ACTIVATOR_ADDRESS = "0x00FA0B000000000000000000000000000000000000";
const BLOCK_HASH = "0xFF00000000000000000000000000000000000000";
const getBlockHash = (indexOfPreviousBlock = 1) => {
    if (indexOfPreviousBlock === 0) {
        throw new Error("Only previous blocks are supported");
    }
    if (indexOfPreviousBlock > 255) {
        throw new Error("Only previous blocks up to 255 are supported");
    }
    return (indexOfPreviousBlock - 1).toString(16).padStart(BLOCK_HASH.length, BLOCK_HASH);
};
exports.default = { Flow, BLOCK_NUMBER, BLOCK_TIMESTAMP, GAS_PRICE, MINER_ADDRESS, ACTIVATOR_ADDRESS, getBlockHash };
