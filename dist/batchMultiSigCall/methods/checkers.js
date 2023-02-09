"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCall = void 0;
const utils_1 = require("ethers/lib/utils");
const constants_1 = require("../../constants");
const helpers_1 = require("..//helpers");
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
function verifyCall(call) {
    // To address validator
    if (!call.to) {
        throw new Error("To address is required");
    }
    else if (typeof call.to === "string") {
        if (call.to.length === 0) {
            throw new Error("To address cannot be empty string");
        }
        if (!(0, utils_1.isAddress)(call.to)) {
            throw new Error("To address is not a valid address");
        }
    }
    // From address validator
    if (!call.from) {
        throw new Error("From address is required");
    }
    else if (typeof call.from === "string") {
        if (call.from.length === 0) {
            throw new Error("From address cannot be empty string");
        }
        if (!(0, utils_1.isAddress)(call.from)) {
            throw new Error("From address is not a valid address");
        }
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
    if (call.params) {
        call.params.map(helpers_1.verifyParam);
    }
}
exports.verifyCall = verifyCall;
