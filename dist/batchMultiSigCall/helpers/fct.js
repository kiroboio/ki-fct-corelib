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
        chainId: 1,
        verifyingContract: "0x087550a787B2720AAC06351065afC1F413D82572",
        // salt: getSaltBuffer("0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572"),
        salt: "0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572",
    },
    "5": {
        name: "FCT Controller",
        version: "1",
        chainId: 5,
        verifyingContract: "0x087550a787B2720AAC06351065afC1F413D82572",
        // salt: getSaltBuffer("0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572"),
        salt: "0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572",
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
        return {
            name: input.name,
            type: input.type,
            value,
        };
    });
};
exports.getParamsFromInputs = getParamsFromInputs;
