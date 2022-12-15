"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariablesAsBytes32 = exports.validateFCT = exports.getFCTMessageHash = exports.recoverAddressFromEIP712 = void 0;
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const ethers_1 = require("ethers");
const recoverAddressFromEIP712 = (typedData, signature) => {
    try {
        const signatureString = ethers_1.utils.joinSignature(signature);
        const address = (0, eth_sig_util_1.recoverTypedSignature)({
            data: typedData,
            version: eth_sig_util_1.SignTypedDataVersion.V4,
            signature: signatureString,
        });
        return address;
    }
    catch (e) {
        return null;
    }
};
exports.recoverAddressFromEIP712 = recoverAddressFromEIP712;
const getFCTMessageHash = (typedData) => {
    // Return FCT Message hash
    return ethers_1.ethers.utils.hexlify(eth_sig_util_1.TypedDataUtils.eip712Hash(typedData, eth_sig_util_1.SignTypedDataVersion.V4));
};
exports.getFCTMessageHash = getFCTMessageHash;
const validateFCT = (FCT, softValidation = false) => {
    const limits = FCT.typedData.message.limits;
    const fctData = FCT.typedData.message.meta;
    const currentDate = new Date().getTime() / 1000;
    const validFrom = parseInt(limits.valid_from);
    const expiresAt = parseInt(limits.expires_at);
    const gasPriceLimit = limits.gas_price_limit;
    if (!softValidation && validFrom > currentDate) {
        throw new Error(`FCT is not valid yet. FCT is valid from ${validFrom}`);
    }
    if (expiresAt < currentDate) {
        throw new Error(`FCT has expired. FCT expired at ${expiresAt}`);
    }
    if (gasPriceLimit === "0") {
        throw new Error(`FCT gas price limit cannot be 0`);
    }
    if (!fctData.eip712) {
        throw new Error(`FCT must be type EIP712`);
    }
    return {
        getOptions: () => {
            return {
                valid_from: limits.valid_from,
                expires_at: limits.expires_at,
                gas_price_limit: limits.gas_price_limit,
                builder: fctData.builder,
            };
        },
        getFCTMessageHash: () => (0, exports.getFCTMessageHash)(FCT.typedData),
        getSigners: () => {
            return FCT.mcall.reduce((acc, { from }) => {
                if (!acc.includes(from)) {
                    acc.push(from);
                }
                return acc;
            }, []);
        },
    };
};
exports.validateFCT = validateFCT;
const getVariablesAsBytes32 = (variables) => {
    return variables.map((v) => {
        if (isNaN(Number(v)) || ethers_1.utils.isAddress(v)) {
            return `0x${String(v).replace("0x", "").padStart(64, "0")}`;
        }
        return `0x${Number(v).toString(16).padStart(64, "0")}`;
    });
};
exports.getVariablesAsBytes32 = getVariablesAsBytes32;
