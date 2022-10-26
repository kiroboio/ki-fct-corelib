"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const FCT_Actuator_abi_json_1 = __importDefault(require("./abi/FCT_Actuator.abi.json"));
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const transactionValidator = async (transactionValidatorInterface) => {
    try {
        const { callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl, activateForFree } = transactionValidatorInterface;
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
        const signer = new ethers_1.ethers.Wallet(actuatorPrivateKey, provider);
        const actuatorContract = new ethers_1.ethers.Contract(actuatorContractAddress, FCT_Actuator_abi_json_1.default, signer);
        let gas;
        if (activateForFree) {
            gas = await actuatorContract.estimateGas.activateForFree(callData);
        }
        else {
            gas = await actuatorContract.estimateGas.activate(callData);
        }
        // Add 15% to gasUsed value
        const gasUsed = Math.round(gas.toNumber() + gas.toNumber() * 0.15);
        return {
            isValid: true,
            gasUsed,
            error: null,
        };
    }
    catch (err) {
        return {
            isValid: false,
            gasUsed: 0,
            error: err.reason,
        };
    }
};
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
// TODO: Check if this is the right way to get FCT Message hash
const getFCTMessageHash = (typedData) => {
    return ethers_1.ethers.utils.hexlify(eth_sig_util_1.TypedDataUtils.encodeData(typedData.primaryType, typedData.message, typedData.types, eth_sig_util_1.SignTypedDataVersion.V4));
};
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
        getFCTMessageHash: () => getFCTMessageHash(FCT.typedData),
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
const getVariablesAsBytes32 = (variables) => {
    return variables.map((v) => {
        if (isNaN(Number(v)) || ethers_1.utils.isAddress(v)) {
            return `0x${String(v).replace("0x", "").padStart(64, "0")}`;
        }
        return `0x${Number(v).toString(16).padStart(64, "0")}`;
    });
};
exports.default = {
    getFCTMessageHash,
    validateFCT,
    recoverAddressFromEIP712,
    getVariablesAsBytes32,
    transactionValidator,
};
