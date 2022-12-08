"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidatorTxData = exports.getValidatorData = exports.getValidatorMethodInterface = exports.getValidatorFunctionData = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const validator_abi_json_1 = __importDefault(require("../abi/validator.abi.json"));
const method_1 = require("./method");
const getValidatorFunctionData = (validator, params) => {
    const iface = new ethers_1.utils.Interface(validator_abi_json_1.default);
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
    const iface = new ethers_1.utils.Interface(validator_abi_json_1.default);
    const validatorFunction = iface.getFunction(validator.method);
    if (!validatorFunction) {
        throw new Error(`Method ${validator.method} not found in Validator ABI`);
    }
    return `${validator.method}(${validatorFunction.inputs.map((item) => item.type).join(",")})`;
};
exports.getValidatorMethodInterface = getValidatorMethodInterface;
const getValidatorData = (call, noFunctionSignature) => {
    const iface = new ethers_1.utils.Interface(validator_abi_json_1.default);
    const data = iface.encodeFunctionData(call.validator.method, [
        ...Object.values(call.validator.params),
        call.to,
        ethers_1.utils.keccak256(ethers_1.utils.toUtf8Bytes((0, method_1.getMethodInterface)(call))),
        (0, method_1.getEncodedMethodParams)(call),
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
    const iface = new ethers_1.utils.Interface(validator_abi_json_1.default);
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
        functionSignature: (0, method_1.getMethodInterface)(call),
        method_data_offset: getValidatorDataOffset(methodDataOffsetTypes, (0, method_1.getEncodedMethodParams)(call)),
        method_data_length: (0, method_1.getParamsLength)((0, method_1.getEncodedMethodParams)(call)),
        ...call.params.reduce((acc, param) => ({
            ...acc,
            [param.name]: param.value,
        }), {}),
    };
};
exports.createValidatorTxData = createValidatorTxData;
