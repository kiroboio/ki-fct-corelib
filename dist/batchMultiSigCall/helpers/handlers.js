"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTypedHashes = exports.handleTypes = exports.handleData = exports.handleEnsHash = exports.handleFunctionSignature = exports.handleMethodInterface = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("../../constants");
const helpers_1 = require("../../helpers");
const handleMethodInterface = (call) => {
    if (call.method) {
        return (0, helpers_1.getMethodInterface)(call);
    }
    return "";
};
exports.handleMethodInterface = handleMethodInterface;
const handleFunctionSignature = (call) => {
    if (call.method) {
        const value = (0, helpers_1.getMethodInterface)(call);
        return ethers_1.utils.id(value);
    }
    return constants_1.nullValue;
};
exports.handleFunctionSignature = handleFunctionSignature;
const handleEnsHash = (call) => {
    if (call.toENS) {
        return ethers_1.utils.id(call.toENS);
    }
    return constants_1.nullValue;
};
exports.handleEnsHash = handleEnsHash;
const handleData = (call) => {
    return (0, helpers_1.getEncodedMethodParams)(call);
};
exports.handleData = handleData;
const handleTypes = (call) => {
    if (call.params) {
        return (0, helpers_1.getTypesArray)(call.params);
    }
    return [];
};
exports.handleTypes = handleTypes;
const handleTypedHashes = (call, typedData) => {
    if (call.params) {
        return (0, helpers_1.getTypedHashes)(call.params, typedData);
    }
    return [];
};
exports.handleTypedHashes = handleTypedHashes;
