"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParamsFromInputs = exports.generateTxType = exports.getTypedDataDomain = exports.TYPED_DATA_DOMAIN = void 0;
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
    return inputs.map((input) => {
        if (input.type === "tuple") {
            return {
                name: input.name,
                type: input.type,
                customType: true,
                value: (0, exports.getParamsFromInputs)(input.components, values[input.name]),
            };
        }
        if (input.type === "tuple[]") {
            return {
                name: input.name,
                type: input.type,
                customType: true,
                value: values[input.name].map((tuple) => (0, exports.getParamsFromInputs)(input.components, tuple)),
            };
        }
        return {
            name: input.name,
            type: input.type,
            value: values[input.name],
        };
    });
};
exports.getParamsFromInputs = getParamsFromInputs;
