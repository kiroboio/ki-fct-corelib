"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParamsFromInputs = exports.generateTxType = exports.getTypedDataDomain = exports.TYPED_DATA_DOMAIN = void 0;
const ethers_1 = require("ethers");
// const getSaltBuffer = (salt: string) => new Uint8Array(Buffer.from(salt.slice(2), "hex"));
// TODO: Change salt to be a buffer
exports.TYPED_DATA_DOMAIN = {
    "1": {
        name: "FCT Controller",
        version: "1",
        chainId: 5,
        verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
        salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
    },
    "5": {
        name: "FCT Controller",
        version: "1",
        chainId: 5,
        verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
        salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
    },
};
const getTypedDataDomain = (chainId) => {
    return exports.TYPED_DATA_DOMAIN[chainId];
};
exports.getTypedDataDomain = getTypedDataDomain;
const generateTxType = (item) => {
    const defaults = [{ name: "details", type: "Transaction_" }];
    if (item.params) {
        const types = item.params.reduce((acc, param) => {
            return [...acc, { name: param.name, type: param.type }];
        }, []);
        return [...defaults, ...types];
    }
    return [{ name: "details", type: "Transaction_" }];
};
exports.generateTxType = generateTxType;
const getParamsFromInputs = (inputs, values) => {
    return inputs.map((input, i) => {
        if (input.type === "tuple") {
            return {
                name: input.name,
                type: input.type,
                customType: true,
                value: (0, exports.getParamsFromInputs)(input.components, values[i]),
            };
        }
        if (input.type === "tuple[]") {
            return {
                name: input.name,
                type: input.type,
                customType: true,
                value: values[i].map((tuple) => (0, exports.getParamsFromInputs)(input.components, tuple)),
            };
        }
        let value = values[i];
        // Check if value isn't a variable
        const variables = ["0xfb0", "0xfa0", "0xfc00000", "0xfd00000", "0xfdb000"];
        if (ethers_1.BigNumber.isBigNumber(value)) {
            const hexString = value.toHexString().toLowerCase();
            if (variables.some((v) => hexString.startsWith(v))) {
                value = hexString;
            }
            value = value.toString();
        }
        if (typeof value === "number") {
            value = value.toString();
        }
        return {
            name: input.name,
            type: input.type,
            value,
        };
    });
};
exports.getParamsFromInputs = getParamsFromInputs;
