import { ethers } from "ethers";

export const multicallContracts = {
  1: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
  5: "0x77dCa2C955b15e9dE4dbBCf1246B4B85b651e50e",
};

export const multicallInterface = new ethers.utils.Interface([
  "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
]);

export const nullValue = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";

export const FCBase = "0xFC00000000000000000000000000000000000000";
export const FCBaseBytes = "0xFC00000000000000000000000000000000000000000000000000000000000000";

export const FDBase = "0xFD00000000000000000000000000000000000000";
export const FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";

export const FDBackBase = "0xFDB0000000000000000000000000000000000000";
export const FDBackBaseBytes = "0xFDB0000000000000000000000000000000000000000000000000000000000000";

export const ComputedBase = "0xFE00000000000000000000000000000000000000";
export const ComputedBaseBytes = "0xFE00000000000000000000000000000000000000000000000000000000000000";

export const CALL_TYPE = {
  ACTION: "0",
  VIEW_ONLY: "1",
  LIBRARY: "2",
};

export const CALL_TYPE_MSG = {
  ACTION: "action",
  VIEW_ONLY: "view only",
  LIBRARY: "library",
};

// Reverse Call Type MSG
export const CALL_TYPE_MSG_REV = {
  action: "ACTION",
  "view only": "VIEW_ONLY",
  library: "LIBRARY",
} as const;

export const FCT_VAULT_ADDRESS = "FCT_VAULT_ADDRESS" as const;
