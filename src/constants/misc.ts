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

export const getFD = ({ callIndex, innerIndex }: { callIndex: number; innerIndex: number }) => {
  const outputIndexHex = (callIndex + 1).toString(16).padStart(4, "0");
  const innerIndexHex = innerIndex.toString(16).padStart(4, "0");

  return (innerIndexHex + outputIndexHex).padStart(FDBase.length, FDBase);
};

export const getFDBytes = ({ callIndex, innerIndex }: { callIndex: number; innerIndex: number }) => {
  const outputIndexHex = (callIndex + 1).toString(16).padStart(4, "0");
  const innerIndexHex = innerIndex.toString(16).padStart(4, "0");

  return (innerIndexHex + outputIndexHex).padStart(FDBaseBytes.length, FDBaseBytes);
};

export const getFDBack = ({ callIndex, innerIndex }: { callIndex: number; innerIndex: number }) => {
  const outputIndexHex = (callIndex + 1).toString(16).padStart(4, "0");
  const innerIndexHex = innerIndex.toString(16).padStart(4, "0");

  return (innerIndexHex + outputIndexHex).padStart(FDBackBase.length, FDBackBase);
};

export const getFDBackBytes = ({ callIndex, innerIndex }: { callIndex: number; innerIndex: number }) => {
  const outputIndexHex = (callIndex + 1).toString(16).padStart(4, "0");
  const innerIndexHex = innerIndex.toString(16).padStart(4, "0");

  return (innerIndexHex + outputIndexHex).padStart(FDBackBaseBytes.length, FDBackBaseBytes);
};
