"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariablesAsBytes32 = void 0;
const ethers_1 = require("ethers");
const getVariablesAsBytes32 = (variables) => {
    return variables.map((v) => {
        if (isNaN(Number(v)) || ethers_1.utils.isAddress(v)) {
            return `0x${String(v).replace("0x", "").padStart(64, "0")}`;
        }
        return `0x${Number(v).toString(16).padStart(64, "0")}`;
    });
};
exports.getVariablesAsBytes32 = getVariablesAsBytes32;
