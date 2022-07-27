"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidatorTxData = exports.getValidatorData = exports.getValidatorMethodInterface = exports.getValidatorFunctionData = exports.getTransaction = exports.getFactoryProxyContract = exports.getParamsOffset = exports.getParamsLength = exports.generateTxType = exports.getEncodedMethodParams = exports.getTypedDataDomain = exports.getTypeHash = exports.getMethodInterface = exports.manageCallFlagsV2 = exports.manageCallFlags = exports.getFlags = exports.getSessionIdDetails = exports.flows = void 0;
const web3_1 = __importDefault(require("web3"));
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const ethers_eip712_1 = require("ethers-eip712");
const factoryProxy__abi_json_1 = __importDefault(require("./abi/factoryProxy_.abi.json"));
const validator_abi_json_1 = __importDefault(require("./abi/validator.abi.json"));
exports.flows = {
    OK_CONT_FAIL_REVERT: {
        text: "continue on success, revert on fail",
        value: "1",
    },
    OK_CONT_FAIL_STOP: {
        text: "continue on success, stop on fail",
        value: "2",
    },
    OK_CONT_FAIL_JUMP: {
        text: "continue on success, jump on fail",
        value: "3",
    },
    OK_REVERT_FAIL_CONT: {
        text: "revert on success, continue on fail",
        value: "4",
    },
    OK_STOP_FAIL_CONT: {
        text: "stop on success, continue on fail",
        value: "5",
    },
    OK_JUMP_FAIL_CONT: {
        text: "jump on success, continue on fail",
        value: "6",
    },
};
// Everything for sessionId
const getGroupId = (group) => group.toString(16).padStart(6, "0");
const getNonce = (nonce) => nonce.toString(16).padStart(10, "0");
const getAfterTimestamp = (epochDate) => epochDate.toString(16).padStart(10, "0");
const getBeforeTimestamp = (infinity, epochDate) => infinity ? "ffffffffff" : epochDate.toString(16).padStart(10, "0");
const getMaxGas = (maxGas) => maxGas.toString(16).padStart(8, "0");
const getMaxGasPrice = (gasPrice) => gasPrice.toString(16).padStart(16, "0");
// Get session id with all the details
const getSessionIdDetails = (call, defaultFlags, smallFlags) => {
    const group = getGroupId(call.groupId);
    const nonce = getNonce(call.nonce);
    const after = getAfterTimestamp(call.afterTimestamp || 0);
    const before = call.beforeTimestamp ? getBeforeTimestamp(false, call.beforeTimestamp) : getBeforeTimestamp(true);
    const gasLimit = getMaxGas(call.gasLimit || 0);
    const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei
    const pureFlags = Object.assign(Object.assign({}, defaultFlags), call.flags);
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
    return `${call.method}(${call.params.map((item) => item.type).join(",")})`;
};
exports.getMethodInterface = getMethodInterface;
// Get typehash from typedData
const getTypeHash = (typedData) => {
    const m2 = ethers_eip712_1.TypedDataUtils.typeHash(typedData.types, typedData.primaryType);
    return ethers_1.ethers.utils.hexZeroPad(ethers_1.ethers.utils.hexlify(m2), 32);
};
exports.getTypeHash = getTypeHash;
// Get Typed Data domain for EIP712
const getTypedDataDomain = (web3, factoryProxy, factoryProxyAddress) => __awaiter(void 0, void 0, void 0, function* () {
    const chainId = yield factoryProxy.methods.CHAIN_ID().call();
    return {
        name: yield factoryProxy.methods.NAME().call(),
        version: yield factoryProxy.methods.VERSION().call(),
        chainId: Number("0x" + web3.utils.toBN(chainId).toString("hex")),
        verifyingContract: factoryProxyAddress,
        salt: yield factoryProxy.methods.uid().call(),
    };
});
exports.getTypedDataDomain = getTypedDataDomain;
//
// METHOD HELPERS FOR FCTs
//
const getEncodedMethodParams = (call, withFunction) => {
    if (!call.method)
        return "0x";
    if (withFunction) {
        const web3 = new web3_1.default();
        return web3.eth.abi.encodeFunctionCall({
            name: call.method,
            type: "function",
            inputs: call.params.map((param) => ({
                type: param.type,
                name: param.name,
            })),
        }, call.params.map((param) => param.value));
    }
    return utils_1.defaultAbiCoder.encode(call.params.map((item) => item.type), call.params.map((item) => item.value));
};
exports.getEncodedMethodParams = getEncodedMethodParams;
const generateTxType = (item) => {
    const defaults = [
        { name: "details", type: "Transaction_" },
        // { name: "method_params_offset", type: "uint256" },
        // { name: "method_params_length", type: "uint256" },
    ];
    if (item.params) {
        if (item.validator) {
            return [
                { name: "details", type: "Transaction_" },
                // { name: "validation_data_offset", type: "uint256" },
                // { name: "validation_data_length", type: "uint256" },
                ...(0, exports.getValidatorFunctionData)(item.validator, item.params),
            ];
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
const getFactoryProxyContract = (web3, proxyContractAddress) => {
    const proxyContract = new web3.eth.Contract(factoryProxy__abi_json_1.default, proxyContractAddress);
    return proxyContract;
};
exports.getFactoryProxyContract = getFactoryProxyContract;
// Returns web3 transaction object
const getTransaction = (web3, address, method, params) => {
    const factoryProxyContract = (0, exports.getFactoryProxyContract)(web3, address);
    return factoryProxyContract.methods[method](...params);
};
exports.getTransaction = getTransaction;
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
        .encode(types, [...types.slice(0, -1).map((item) => "0x" + "0".repeat(64)), data])
        .slice(64 * types.slice(0, -1).length + 2, 64 * types.length + 2)}`;
};
const createValidatorTxData = (call) => {
    const iface = new ethers_1.ethers.utils.Interface(validator_abi_json_1.default);
    const validatorFunction = iface.getFunction(call.validator.method);
    let validator = call.validator;
    if (!validatorFunction) {
        throw new Error(`Method ${validator.method} not found in Validator ABI`);
    }
    const encodedData = (0, exports.getValidatorData)(call, true);
    const methodDataOffsetTypes = [
        ...[...Array(validatorFunction.inputs.length - 1).keys()].map(() => "bytes32"),
        "bytes",
    ];
    return Object.assign(Object.assign(Object.assign({}, validator.params), { contractAddress: call.to, functionSignature: (0, exports.getMethodInterface)(call), method_data_offset: getValidatorDataOffset(methodDataOffsetTypes, (0, exports.getEncodedMethodParams)(call)), method_data_length: (0, exports.getParamsLength)((0, exports.getEncodedMethodParams)(call)) }), call.params.reduce((acc, param) => (Object.assign(Object.assign({}, acc), { [param.name]: param.value })), {}));
};
exports.createValidatorTxData = createValidatorTxData;
