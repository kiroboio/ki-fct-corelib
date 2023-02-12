"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCall = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("../../constants");
const helpers_1 = require("..//helpers");
// Change
const isInteger = (value, key) => {
    if (value.length === 0) {
        throw new Error(`${key} cannot be empty string`);
    }
    if (value.startsWith("-")) {
        throw new Error(`${key} cannot be negative`);
    }
    if (value.includes(".")) {
        throw new Error(`${key} cannot be a decimal`);
    }
};
const isAddress = (value, key) => {
    if (value.length === 0) {
        throw new Error(`${key} address cannot be empty string`);
    }
    if (!ethers_1.utils.isAddress(value)) {
        throw new Error(`${key} address is not a valid address`);
    }
};
function verifyCall(call) {
    // To address validator
    if (!call.to) {
        throw new Error("To address is required");
    }
    else if (typeof call.to === "string") {
        isAddress(call.to, "To");
    }
    // From address validator
    if (!call.from) {
        throw new Error("From address is required");
    }
    else if (typeof call.from === "string") {
        isAddress(call.from, "From");
    }
    // Value validator
    if (call.value && typeof call.value === "string") {
        isInteger(call.value, "Value");
    }
    // Method validator
    if (call.method && call.method.length === 0) {
        throw new Error("Method cannot be empty string");
    }
    // Node ID validator
    if (call.nodeId) {
        const index = this.calls.findIndex((item) => item.nodeId === call.nodeId);
        if (index > 0) {
            throw new Error(`Node ID ${call.nodeId} already exists, please use a different one`);
        }
    }
    // Options validator
    if (call.options) {
        const { gasLimit, callType } = call.options;
        if (gasLimit && typeof gasLimit === "string") {
            isInteger(gasLimit, "Gas limit");
        }
        if (callType) {
            const keysOfCALLTYPE = Object.keys(constants_1.CALL_TYPE);
            if (!keysOfCALLTYPE.includes(callType)) {
                throw new Error(`Call type ${callType} is not valid`);
            }
        }
    }
    if (call.params && call.params.length) {
        if (!call.method) {
            throw new Error("Method is required when params are present");
        }
        call.params.map(helpers_1.verifyParam);
    }
}
exports.verifyCall = verifyCall;
