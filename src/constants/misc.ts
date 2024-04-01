import { ethers } from "ethers";

const { keccak256, toUtf8Bytes } = ethers.utils;

export const multicallContracts = {
  1: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
  5: "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696",
  42161: "0x842eC2c7D803033Edf55E478F461FC547Bc54EB2",
  421613: "0x961E16D26D3f1fc042F192a2e5054120938c1CD5",
};

export const nullValue = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";

export const ExternalVariableBaseAddress = "0xFC00000000000000000000000000000000000000";
export const ExternalVariableBaseBytes32 = "0xFC00000000000000000000000000000000000000000000000000000000000000";

export const OutputVariableBaseAddress = "0xFD00000000000000000000000000000000000000";
export const OutputVariableBaseBytes32 = "0xFD00000000000000000000000000000000000000000000000000000000000000";

export const BackOutputVariableBaseAddress = "0xFDB0000000000000000000000000000000000000";
export const BackOutputVariableBaseBytes32 = "0xFDB0000000000000000000000000000000000000000000000000000000000000";

export const ComputedBaseAddress = "0xFE00000000000000000000000000000000000000";
export const ComputedBaseBytes32 = "0xFE00000000000000000000000000000000000000000000000000000000000000";

export const ValidationBase = "0xE900000000000000000000000000000000000000000000000000000000000000";

export const ValidationOperator = {
  equal: keccak256(toUtf8Bytes("equal")),
  "not equal": keccak256(toUtf8Bytes("not equal")),
  "greater than": keccak256(toUtf8Bytes("greater than")),
  "greater equal than": keccak256(toUtf8Bytes("greater equal than")),
  or: keccak256(toUtf8Bytes("or")),
  "or not": keccak256(toUtf8Bytes("or not")),
  and: keccak256(toUtf8Bytes("and")),
  "and not": keccak256(toUtf8Bytes("and not")),
} as const;

export const CALL_TYPE = {
  ACTION: "0",
  VIEW_ONLY: "1",
  LIBRARY: "2",
  LIBRARY_VIEW_ONLY: "3",
} as const;

export const CALL_TYPE_MSG = {
  ACTION: "action",
  VIEW_ONLY: "view only",
  LIBRARY: "library: action",
  LIBRARY_VIEW_ONLY: "library: view only",
} as const;

// Reverse Call Type MSG
export const CALL_TYPE_MSG_REV = {
  action: "ACTION",
  "view only": "VIEW_ONLY",
  "library: action": "LIBRARY",
  "library: view only": "LIBRARY_VIEW_ONLY",
} as const;

export const FCT_VAULT_ADDRESS = "FCT_VAULT_ADDRESS" as const;
