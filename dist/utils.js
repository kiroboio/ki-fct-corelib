"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const ethers_eip712_1 = require("ethers-eip712");
const ganache_1 = __importDefault(require("ganache"));
const FCT_Actuator_abi_json_1 = __importDefault(require("./abi/FCT_Actuator.abi.json"));
const transactionValidator = async (transactionValidatorInterface) => {
    const { callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl } = transactionValidatorInterface;
    // Creates a forked ganache instance from indicated chainId's rpcUrl
    const ganacheProvider = ganache_1.default.provider({
        fork: {
            url: rpcUrl,
        },
    });
    const provider = new ethers_1.ethers.providers.Web3Provider(ganacheProvider);
    const signer = new ethers_1.ethers.Wallet(actuatorPrivateKey, provider);
    const actuatorContract = new ethers_1.ethers.utils.Interface(FCT_Actuator_abi_json_1.default);
    const tx = await signer.sendTransaction({
        to: actuatorContractAddress,
        data: actuatorContract.encodeFunctionData("activate", [callData]),
    });
    const receipt = await tx.wait();
    return {
        isValid: true,
        gasUsed: receipt.gasUsed,
    };
};
const recoverAddressFromEIP712 = (typedData, signature) => {
    try {
        const messageHash = ethers_1.ethers.utils.arrayify(ethers_eip712_1.TypedDataUtils.encodeDigest(typedData));
        return ethers_1.ethers.utils.recoverAddress(messageHash, signature);
    }
    catch (e) {
        return null;
    }
};
const getFCTMessageHash = (typedData) => {
    return ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.encodeDigest(typedData));
};
const validateFCT = (FCT, softValidation = false) => {
    const limits = FCT.typedData.message.limits;
    const fctData = FCT.typedData.message.fct;
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
