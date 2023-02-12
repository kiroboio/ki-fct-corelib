"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthenticatorSignature = void 0;
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const utils_1 = require("ethers/lib/utils");
const AUTHENTICATOR_PRIVATE_KEY = "5c35caeef2837c989ca02120f70b439b1f3266b779db6eb38ccabba24a2522b3";
const getAuthenticatorSignature = (typedData) => {
    const signature = (0, eth_sig_util_1.signTypedData)({
        data: typedData,
        privateKey: Buffer.from(AUTHENTICATOR_PRIVATE_KEY, "hex"),
        version: eth_sig_util_1.SignTypedDataVersion.V4,
    });
    return (0, utils_1.splitSignature)(signature);
};
exports.getAuthenticatorSignature = getAuthenticatorSignature;
