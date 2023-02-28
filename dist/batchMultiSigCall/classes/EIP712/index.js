"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EIP712 = void 0;
const constants_1 = require("./constants");
class EIP712 {
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
