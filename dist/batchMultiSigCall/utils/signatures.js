"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthenticatorSignature = void 0;
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const utils_1 = require("ethers/lib/utils");
const util_1 = __importDefault(require("util"));
const AUTHENTICATOR_PRIVATE_KEY = "5c35caeef2837c989ca02120f70b439b1f3266b779db6eb38ccabba24a2522b3";
const getAuthenticatorSignature = (typedData) => {
    try {
        const signature = (0, eth_sig_util_1.signTypedData)({
            data: typedData,
            privateKey: Buffer.from(AUTHENTICATOR_PRIVATE_KEY, "hex"),
            version: eth_sig_util_1.SignTypedDataVersion.V4,
        });
        return (0, utils_1.splitSignature)(signature);
    }
    catch {
        console.log(util_1.default.inspect(typedData, false, null, true /* enable colors */));
        return { r: "0x", s: "0x", v: 0 };
    }
};
exports.getAuthenticatorSignature = getAuthenticatorSignature;
