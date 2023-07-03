import { ethers } from "ethers";

const { keccak256, toUtf8Bytes } = ethers.utils;

export const multicallContracts = {
  1: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
  5: "0x77dCa2C955b15e9dE4dbBCf1246B4B85b651e50e",
};

export const nullValue = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";

export const FCBase = "0xFC00000000000000000000000000000000000000";
export const FCBaseBytes = "0xFC00000000000000000000000000000000000000000000000000000000000000";

export const FDBase = "0xFD00000000000000000000000000000000000000";
export const FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";

export const FDBackBase = "0xFDB0000000000000000000000000000000000000";
export const FDBackBaseBytes = "0xFDB0000000000000000000000000000000000000000000000000000000000000";

export const ComputedBase = "0xFE00000000000000000000000000000000000000";
export const ComputedBaseBytes = "0xFE00000000000000000000000000000000000000000000000000000000000000";

export const ValidationBase = "0xE900000000000000000000000000000000000000000000000000000000000000";

export const ValidationOperator = {
  equal: keccak256(toUtf8Bytes("equal")),
  "greater than": keccak256(toUtf8Bytes("greater than")),
  "greater equal than": keccak256(toUtf8Bytes("greater equal than")),
  or: keccak256(toUtf8Bytes("or")),
  and: keccak256(toUtf8Bytes("and")),
  "and not": keccak256(toUtf8Bytes("and not")),
  "not equal": keccak256(toUtf8Bytes("not equal")),
} as const;

export const CALL_TYPE = {
  ACTION: "0",
  VIEW_ONLY: "1",
  LIBRARY: "2",
  LIBRARY_VIEW_ONLY: "3",
};

export const CALL_TYPE_MSG = {
  ACTION: "action",
  VIEW_ONLY: "view only",
  LIBRARY: "library: action",
  LIBRARY_VIEW_ONLY: "library: view only",
};

// Reverse Call Type MSG
export const CALL_TYPE_MSG_REV = {
  action: "ACTION",
  "view only": "VIEW_ONLY",
  "library: action": "LIBRARY",
  "library: view only": "LIBRARY_VIEW_ONLY",
} as const;

export const FCT_VAULT_ADDRESS = "FCT_VAULT_ADDRESS" as const;
