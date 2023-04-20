"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Multisig = exports.Recurrency = exports.Call = exports.Computed = exports.Limits = exports.Meta = exports.EIP712Domain = void 0;
exports.EIP712Domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
    { name: "salt", type: "bytes32" },
];
exports.Meta = [
    { name: "name", type: "string" },
    { name: "builder", type: "address" },
    { name: "selector", type: "bytes4" },
    { name: "version", type: "bytes3" },
    { name: "random_id", type: "bytes3" },
    { name: "eip712", type: "bool" },
    { name: "auth_enabled", type: "bool" },
];
exports.Limits = [
    { name: "valid_from", type: "uint40" },
    { name: "expires_at", type: "uint40" },
    { name: "gas_price_limit", type: "uint64" },
    { name: "purgeable", type: "bool" },
    { name: "blockable", type: "bool" },
];
exports.Computed = [
    { name: "index", type: "uint256" },
    { name: "value", type: "uint256" },
    { name: "add", type: "uint256" },
    { name: "sub", type: "uint256" },
    { name: "pow", type: "uint256" },
    { name: "mul", type: "uint256" },
    { name: "div", type: "uint256" },
    { name: "mod", type: "uint256" },
];
exports.Call = [
    { name: "call_index", type: "uint16" },
    { name: "payer_index", type: "uint16" },
    { name: "call_type", type: "string" },
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "to_ens", type: "string" },
    { name: "eth_value", type: "uint256" },
    { name: "gas_limit", type: "uint32" },
    { name: "permissions", type: "uint16" },
    { name: "flow_control", type: "string" },
    { name: "returned_false_means_fail", type: "bool" },
    { name: "jump_on_success", type: "uint16" },
    { name: "jump_on_fail", type: "uint16" },
    { name: "method_interface", type: "string" },
];
exports.Recurrency = [
    { name: "max_repeats", type: "uint16" },
    { name: "chill_time", type: "uint32" },
    { name: "accumetable", type: "bool" },
];
exports.Multisig = [
    { name: "external_signers", type: "address[]" },
    { name: "minimum_approvals", type: "uint8" },
];
