import { MessageTypeProperty } from "@metamask/eth-sig-util";
// NEW VERSION - 0x020201

// bytes32 constant BATCH_MULTI_SIG_CALL_META_TYPEHASH = keccak256(
//     "Meta(string name,string app,string app_version,string builder,address builder_address,string domain)"
// );

// bytes32 constant BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH = keccak256(
//     "Limits(uint40 valid_from,uint40 expires_at,uint24 payable_gas_limit_in_kilo,uint40 max_payable_gas_price,bool purgeable,bool blockable)"
// );

// Meta(string name,string app,string app_version,string builder,address builder_address,string domain)
const Meta: MessageTypeProperty[] = [
  { name: "name", type: "string" },
  { name: "app", type: "string" },
  { name: "app_version", type: "string" },
  { name: "builder", type: "string" },
  { name: "builder_address", type: "address" },
  { name: "domain", type: "string" },
];

// Engine(bytes4 selector,bytes3 version,bytes3 random_id,bool eip712,string verifier,bool auth_enabled,bool dry_run)
const Engine: MessageTypeProperty[] = [
  { name: "selector", type: "bytes4" },
  { name: "version", type: "bytes3" },
  { name: "random_id", type: "bytes3" },
  { name: "eip712", type: "bool" },
  { name: "verifier", type: "string" },
  { name: "auth_enabled", type: "bool" },
  { name: "dry_run", type: "bool" },
];

const Limits: MessageTypeProperty[] = [
  { name: "valid_from", type: "uint40" },
  { name: "expires_at", type: "uint40" },
  { name: "payable_gas_limit_in_kilo", type: "uint24" },
  { name: "max_payable_gas_price", type: "uint40" },
  { name: "purgeable", type: "bool" },
  { name: "blockable", type: "bool" },
];

// export class EIP712_newVersion extends EIP712Base {
//   getEngineType() {
//     return Engine;
//   }
//   getLimitsType() {
//     return Limits;
//   }
// }
