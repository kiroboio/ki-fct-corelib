"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidatorTxData = exports.getValidatorData = exports.getValidatorMethodInterface = exports.getValidatorFunctionData = exports.getParamsOffset = exports.getParamsLength = exports.generateTxType = exports.getEncodedMethodParams = exports.getTypedDataDomain = exports.getTypeHash = exports.getMethodInterface = exports.manageCallFlagsV2 = exports.manageCallFlags = exports.getFlags = exports.getSessionIdDetails = exports.getTypedHashes = exports.getTypesArray = exports.flows = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const ethers_eip712_1 = require("ethers-eip712");
const validator_abi_json_1 = __importDefault(require("./abi/validator.abi.json"));
exports.flows = {
    OK_CONT_FAIL_REVERT: {
        text: "continue on success, revert on fail",
        value: "0",
    },
    OK_CONT_FAIL_STOP: {
        text: "continue on success, stop on fail",
        value: "1",
    },
    OK_CONT_FAIL_CONT: {
        text: "continue on success, continue on fail",
        value: "2",
    },
    OK_REVERT_FAIL_CONT: {
        text: "revert on success, continue on fail",
        value: "3",
    },
    OK_REVERT_FAIL_STOP: {
        text: "revert on success, stop on fail",
        value: "4",
    },
    OK_STOP_FAIL_CONT: {
        text: "stop on success, continue on fail",
        value: "5",
    },
    OK_STOP_FAIL_REVERT: {
        text: "stop on success, revert on fail",
        value: "6",
    },
    OK_STOP_FAIL_STOP: {
        text: "stop on success, stop on fail",
        value: "7",
    },
};
function instanceOfParams(objectOrArray) {
    if (Array.isArray(objectOrArray)) {
        return instanceOfParams(objectOrArray[0]);
    }
    return typeof objectOrArray === "object" && "type" in objectOrArray;
}
// Everything for sessionId
const getGroupId = (group) => group.toString(16).padStart(6, "0");
const getNonce = (nonce) => nonce.toString(16).padStart(10, "0");
const getAfterTimestamp = (epochDate) => epochDate.toString(16).padStart(10, "0");
const getBeforeTimestamp = (infinity, epochDate) => infinity ? "ffffffffff" : epochDate.toString(16).padStart(10, "0");
const getMaxGas = (maxGas) => maxGas.toString(16).padStart(8, "0");
const getMaxGasPrice = (gasPrice) => gasPrice.toString(16).padStart(16, "0");
const TYPE_NATIVE = 1000;
const TYPE_STRING = 2000;
const TYPE_BYTES = 3000;
const TYPE_ARRAY = 4000;
const TYPE_ARRAY_WITH_LENGTH = 5000;
const typeValue = (param) => {
    // return [];
    // If type is an array
    if (param.type.lastIndexOf("[") > 0) {
        if (param.customType || param.type.includes("tuple")) {
            const value = param.value;
            return [TYPE_ARRAY, value.length, ...(0, exports.getTypesArray)(param.value[0])];
        }
        const parameter = { ...param, type: param.type.slice(0, param.type.lastIndexOf("[")) };
        const insideType = typeValue(parameter);
        const type = param.type.indexOf("]") - param.type.indexOf("[") === 1 ? TYPE_ARRAY : TYPE_ARRAY_WITH_LENGTH;
        return [type, ...insideType];
    }
    // If type is a string
    if (param.type === "string") {
        return [TYPE_STRING];
    }
    // If type is bytes
    if (param.type === "bytes") {
        return [TYPE_BYTES];
    }
    // If param is custom struct
    if (param.customType || param.type.includes("tuple")) {
        const values = param.value;
        return [
            values.length,
            ...values.reduce((acc, item) => {
                return [...acc, ...typeValue(item)];
            }, []),
        ];
    }
    // If all statements above are false, then type is a native type
    return [TYPE_NATIVE];
};
// Get Types array
const getTypesArray = (params) => {
    const types = params.reduce((acc, item) => {
        const data = typeValue(item);
        return [...acc, ...data];
    }, []);
    return types.some((item) => item !== TYPE_NATIVE) ? types : [];
};
exports.getTypesArray = getTypesArray;
const getTypedHashes = (params, typedData) => {
    return params.reduce((acc, item) => {
        if (item.customType) {
            const type = item.type.lastIndexOf("[") > 0 ? item.type.slice(0, item.type.lastIndexOf("[")) : item.type;
            return [...acc, ethers_1.ethers.utils.hexlify(ethers_1.ethers.utils.hexlify(ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, type)))];
        }
        return acc;
    }, []);
};
exports.getTypedHashes = getTypedHashes;
// Get session id with all the details
const getSessionIdDetails = (call, defaultFlags, smallFlags) => {
    const group = getGroupId(call.groupId);
    const nonce = getNonce(call.nonce);
    const after = getAfterTimestamp(call.afterTimestamp || 0);
    const before = call.beforeTimestamp ? getBeforeTimestamp(false, call.beforeTimestamp) : getBeforeTimestamp(true);
    const gasLimit = getMaxGas(call.gasLimit || 0);
    const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
    const pureFlags = { ...defaultFlags, ...call.flags };
    const flags = (0, exports.getFlags)(pureFlags, smallFlags);
    return {
        group,
        nonce,
        after,
        before,
        gasLimit,
        maxGasPrice,
        flags,
        pureFlags,
        sessionId: `0x${group}${nonce}${after}${before}${gasLimit}${maxGasPrice}${flags}`,
    };
};
exports.getSessionIdDetails = getSessionIdDetails;
// Get batch flags
const getFlags = (flags, small) => {
    const array = ["0", "0", "0", "0"];
    if (flags.eip712 || flags.viewOnly || flags.cancelable) {
        array[1] = flags.cancelable ? "8" : flags.viewOnly ? "4" : "1";
    }
    array[0] = flags.payment ? "f" : "0";
    if (flags.flow) {
        array[2] = "f";
        array[3] = "f";
    }
    return small ? array.slice(0, 2).join("") : array.join("");
};
exports.getFlags = getFlags;
// Get flags for single call in multicalls
const manageCallFlags = (flags) => {
    const array = ["0", "x", "0", "0"];
    if (flags.onFailContinue && flags.onFailStop) {
        throw new Error("Both flags onFailContinue and onFailStop can't be enabled at once");
    }
    if (flags.onSuccessRevert && flags.onSuccessStop) {
        throw new Error("Both flags onSuccessRevert and onSuccessStop can't be enabled at once");
    }
    array[2] = flags.onSuccessRevert ? "2" : flags.onSuccessRevert ? "1" : "0";
    array[3] = flags.onFailContinue ? "2" : flags.onFailStop ? "1" : "0";
    return array.join("");
};
exports.manageCallFlags = manageCallFlags;
const manageCallFlagsV2 = (flow, jump) => {
    if (jump > 15) {
        throw new Error("Jump value cannot exceed 15");
    }
    if (!exports.flows[flow]) {
        throw new Error("Flow not found");
    }
    return `0x${exports.flows[flow].value}${jump.toString(16)}`;
};
exports.manageCallFlagsV2 = manageCallFlagsV2;
// From method and params create tuple
const getMethodInterface = (call) => {
    const getParamsType = (param) => {
        if (instanceOfParams(param.value)) {
            if (Array.isArray(param.value[0])) {
                const value = param.value[0];
                return `(${value.map(getParamsType).join(",")})[]`;
            }
            else {
                const value = param.value;
                return `(${value.map(getParamsType).join(",")})`;
            }
        }
        return param.type;
    };
    const params = call.params.map(getParamsType);
    return `${call.method}(${params})`;
};
exports.getMethodInterface = getMethodInterface;
// Get typehash from typedData
const getTypeHash = (typedData) => {
    const m2 = ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, typedData.primaryType);
    return ethers_1.ethers.utils.hexZeroPad(ethers_1.ethers.utils.hexlify(m2), 32);
};
exports.getTypeHash = getTypeHash;
// Get Typed Data domain for EIP712
const getTypedDataDomain = async (factoryProxy) => {
    const chainId = await factoryProxy.CHAIN_ID();
    return {
        name: await factoryProxy.NAME(),
        version: await factoryProxy.VERSION(),
        chainId: chainId.toNumber(),
        verifyingContract: factoryProxy.address,
        salt: await factoryProxy.UID(),
    };
};
exports.getTypedDataDomain = getTypedDataDomain;
const getEncodedMethodParams = (call, withFunction) => {
    if (!call.method)
        return "0x";
    if (withFunction) {
        const ABI = [`function ${call.method}(${call.params.map((item) => item.type).join(",")})`];
        const iface = new ethers_1.ethers.utils.Interface(ABI);
        return iface.encodeFunctionData(call.method, call.params.map((item) => item.value));
    }
    const getType = (param) => {
        if (param.customType || param.type.includes("tuple")) {
            let value;
            let isArray = false;
            if (param.type.lastIndexOf("[") > 0) {
                isArray = true;
                value = param.value[0];
            }
            else {
                value = param.value;
            }
            return `(${value.map(getType).join(",")})${isArray ? "[]" : ""}`;
        }
        return param.type;
    };
    const getValues = (param) => {
        if (param.customType || param.type.includes("tuple")) {
            let value;
            if (param.type.lastIndexOf("[") > 0) {
                value = param.value;
                return value.reduce((acc, val) => {
                    return [...acc, val.map(getValues)];
                }, []);
            }
            else {
                value = param.value;
                return value.map(getValues);
            }
        }
        return param.value;
    };
    return utils_1.defaultAbiCoder.encode(call.params.map(getType), call.params.map(getValues));
};
exports.getEncodedMethodParams = getEncodedMethodParams;
const generateTxType = (item) => {
    const defaults = [{ name: "details", type: "Transaction_" }];
    if (item.params) {
        if (item.validator) {
            return [{ name: "details", type: "Transaction_" }, ...(0, exports.getValidatorFunctionData)(item.validator, item.params)];
        }
        const types = item.params.reduce((acc, param) => {
            return [...acc, { name: param.name, type: param.type }];
        }, []);
        return [...defaults, ...types];
    }
    return [{ name: "details", type: "Transaction_" }];
};
exports.generateTxType = generateTxType;
const getParamsLength = (encodedParams) => {
    const paramsLength = utils_1.defaultAbiCoder.encode(["bytes"], [encodedParams]).slice(66, 66 + 64);
    return `0x${paramsLength}`;
};
exports.getParamsLength = getParamsLength;
const getParamsOffset = () => {
    return `0x0000000000000000000000000000000000000000000000000000000000000060`;
};
exports.getParamsOffset = getParamsOffset;
//
//  END OF METHOD HELPERS FOR FCTs
//
//
// VALIDATOR FUNCTION HELPERS
//
const getValidatorFunctionData = (validator, params) => {
    const iface = new ethers_1.ethers.utils.Interface(validator_abi_json_1.default);
    const validatorFunction = iface.getFunction(validator.method);
    return validatorFunction.inputs.reduce((acc, item) => {
        if (item.type === "bytes" && item.name === "data") {
            return [
                ...acc,
                { name: "method_data_offset", type: "uint256" },
                { name: "method_data_length", type: "uint256" },
                ...params.map((param) => ({ name: param.name, type: param.type })),
            ];
        }
        return [...acc, { name: item.name, type: item.type === "bytes32" ? "string" : item.type }];
    }, []);
};
exports.getValidatorFunctionData = getValidatorFunctionData;
const getValidatorMethodInterface = (validator) => {
    const iface = new ethers_1.ethers.utils.Interface(validator_abi_json_1.default);
    const validatorFunction = iface.getFunction(validator.method);
    if (!validatorFunction) {
        throw new Error(`Method ${validator.method} not found in Validator ABI`);
    }
    return `${validator.method}(${validatorFunction.inputs.map((item) => item.type).join(",")})`;
};
exports.getValidatorMethodInterface = getValidatorMethodInterface;
const getValidatorData = (call, noFunctionSignature) => {
    const iface = new ethers_1.ethers.utils.Interface(validator_abi_json_1.default);
    const data = iface.encodeFunctionData(call.validator.method, [
        ...Object.values(call.validator.params),
        call.to,
        ethers_1.ethers.utils.keccak256(ethers_1.ethers.utils.toUtf8Bytes((0, exports.getMethodInterface)(call))),
        (0, exports.getEncodedMethodParams)(call),
    ]);
    return noFunctionSignature ? `0x${data.slice(10)}` : data;
};
exports.getValidatorData = getValidatorData;
const getValidatorDataOffset = (types, data) => {
    return `0x${utils_1.defaultAbiCoder
        .encode(types, [...types.slice(0, -1).map(() => "0x" + "0".repeat(64)), data])
        .slice(64 * types.slice(0, -1).length + 2, 64 * types.length + 2)}`;
};
const createValidatorTxData = (call) => {
    const iface = new ethers_1.ethers.utils.Interface(validator_abi_json_1.default);
    const validatorFunction = iface.getFunction(call.validator.method);
    const validator = call.validator;
    if (!validatorFunction) {
        throw new Error(`Method ${validator.method} not found in Validator ABI`);
    }
    // const encodedData = getValidatorData(call, true);
    const methodDataOffsetTypes = [
        ...[...Array(validatorFunction.inputs.length - 1).keys()].map(() => "bytes32"),
        "bytes",
    ];
    return {
        ...validator.params,
        contractAddress: call.to,
        functionSignature: (0, exports.getMethodInterface)(call),
        method_data_offset: getValidatorDataOffset(methodDataOffsetTypes, (0, exports.getEncodedMethodParams)(call)),
        method_data_length: (0, exports.getParamsLength)((0, exports.getEncodedMethodParams)(call)),
        ...call.params.reduce((acc, param) => ({
            ...acc,
            [param.name]: param.value,
        }), {}),
    };
};
exports.createValidatorTxData = createValidatorTxData;
