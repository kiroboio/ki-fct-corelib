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
const MINDER_ADDRESS = "0xFA0A000000000000000000000000000000000000";
const ACTIVATOR_ADDRESS = "0x00FA0B000000000000000000000000000000000000";
exports.default = { Flow, BLOCK_NUMBER, BLOCK_TIMESTAMP, GAS_PRICE, MINDER_ADDRESS, ACTIVATOR_ADDRESS };
