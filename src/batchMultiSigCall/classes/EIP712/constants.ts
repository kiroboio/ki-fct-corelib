import { MessageTypeProperty } from "@metamask/eth-sig-util";

export const EIP712Domain: MessageTypeProperty[] = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
  { name: "salt", type: "bytes32" },
];

export const Meta: MessageTypeProperty[] = [
  { name: "name", type: "string" },
  { name: "builder", type: "address" },
  { name: "selector", type: "bytes4" },
  { name: "version", type: "bytes3" },
  { name: "random_id", type: "bytes3" },
  { name: "eip712", type: "bool" },
  { name: "auth_enabled", type: "bool" },
];

export const Limits: MessageTypeProperty[] = [
  { name: "valid_from", type: "uint40" },
  { name: "expires_at", type: "uint40" },
  { name: "gas_price_limit", type: "uint64" },
  { name: "purgeable", type: "bool" },
  { name: "blockable", type: "bool" },
];

export const Computed: MessageTypeProperty[] = [
  { name: "index", type: "uint256" },
  { name: "value_1", type: "uint256" },
  { name: "op_1", type: "string" },
  { name: "value_2", type: "uint256" },
  { name: "op_2", type: "string" },
  { name: "value_3", type: "uint256" },
  { name: "op_3", type: "string" },
  { name: "value_4", type: "uint256" },
  { name: "overflow_protection", type: "bool" },
];

export const Call: MessageTypeProperty[] = [
  { name: "call_index", type: "uint16" },
  { name: "payer_index", type: "uint16" },
  { name: "call_type", type: "string" },
  { name: "from", type: "address" },
  { name: "to", type: "address" },
  { name: "to_ens", type: "string" },
  { name: "eth_value", type: "uint256" },
  { name: "gas_limit", type: "uint32" },
  { name: "validation", type: "uint16" },
  { name: "permissions", type: "uint16" },
  { name: "flow_control", type: "string" },
  { name: "returned_false_means_fail", type: "bool" },
  { name: "jump_on_success", type: "uint16" },
  { name: "jump_on_fail", type: "uint16" },
  { name: "method_interface", type: "string" },
];

export const Recurrency: MessageTypeProperty[] = [
  { name: "max_repeats", type: "uint16" },
  { name: "chill_time", type: "uint32" },
  { name: "accumetable", type: "bool" },
];

export const Multisig: MessageTypeProperty[] = [
  { name: "external_signers", type: "address[]" },
  { name: "minimum_approvals", type: "uint8" },
];

export const Validation: MessageTypeProperty[] = [
  { name: "index", type: "uint256" },
  { name: "value1", type: "uint256" },
  { name: "operator", type: "string" },
  { name: "value2", type: "uint256" },
];
