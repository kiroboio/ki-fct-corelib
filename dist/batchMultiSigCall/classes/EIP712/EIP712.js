"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EIP712 = void 0;
const helpers_1 = require("./helpers");
class EIP712 {
}
exports.EIP712 = EIP712;
EIP712.domain = helpers_1.EIP712Domain;
EIP712.meta = helpers_1.Meta;
EIP712.limits = helpers_1.Limits;
EIP712.computed = helpers_1.Computed;
EIP712.call = helpers_1.Call;
EIP712.recurrency = helpers_1.Recurrency;
EIP712.multisig = helpers_1.Multisig;
