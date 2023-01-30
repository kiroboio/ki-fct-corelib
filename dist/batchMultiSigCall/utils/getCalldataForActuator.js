"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalldataForActuator = void 0;
const ethers_1 = require("ethers");
const FCT_BatchMultiSigCall_abi_json_1 = __importDefault(require("../../abi/FCT_BatchMultiSigCall.abi.json"));
function getCalldataForActuator({ signedFCT, purgedFCT, investor, activator, version, }) {
    const FCT_BatchMultiSigCall = new ethers_1.utils.Interface(FCT_BatchMultiSigCall_abi_json_1.default);
    return FCT_BatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
        `0x${version}`.padEnd(66, "0"),
        signedFCT,
        purgedFCT,
        investor,
        activator,
    ]);
}
exports.getCalldataForActuator = getCalldataForActuator;
