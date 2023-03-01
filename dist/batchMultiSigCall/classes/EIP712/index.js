"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EIP712 = void 0;
const constants_1 = require("./constants");
const TYPED_DATA_DOMAIN = {
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
class EIP712 {
    static getTypedDataDomain(chainId) {
        return TYPED_DATA_DOMAIN[chainId];
    }
}
exports.EIP712 = EIP712;
EIP712.types = {
    domain: constants_1.EIP712Domain,
    meta: constants_1.Meta,
    limits: constants_1.Limits,
    computed: constants_1.Computed,
    call: constants_1.Call,
    recurrency: constants_1.Recurrency,
    multisig: constants_1.Multisig,
};
