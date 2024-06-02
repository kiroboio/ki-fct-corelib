"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthenticatorSignature = void 0;
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const ethers_1 = require("ethers");
const AUTHENTICATOR_PRIVATE_KEY = "5c35caeef2837c989ca02120f70b439b1f3266b779db6eb38ccabba24a2522b3";
const getAuthenticatorSignature = (typedData) => {
    try {
        const signature = (0, eth_sig_util_1.signTypedData)({
            data: typedData,
            privateKey: Buffer.from(AUTHENTICATOR_PRIVATE_KEY, "hex"),
            version: eth_sig_util_1.SignTypedDataVersion.V4,
        });
        return ethers_1.ethers.utils.splitSignature(signature);
    }
    catch (e) {
        throw new Error("Error signing typed data");
    }
};
exports.getAuthenticatorSignature = getAuthenticatorSignature;
//# sourceMappingURL=signatures.js.map