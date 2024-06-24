import { ethers } from "ethers";

export type ConstantVariable = keyof typeof constantVariables;

const MAX_UINT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" as const;

export const constantVariables = {
  addressZero: ethers.constants.AddressZero,
  maxUint: MAX_UINT,
  hashZero: ethers.constants.HashZero,
} as const;
