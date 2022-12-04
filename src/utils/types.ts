import { BatchMultiSigCallTypedData, MSCall } from "batchMultiSigCall/interfaces";

export interface IFCT {
  typedData: BatchMultiSigCallTypedData;
  mcall: MSCall[];
}

export interface ITxValidator {
  rpcUrl: string;
  callData: string;
  actuatorPrivateKey: string;
  actuatorContractAddress: string;
  activateForFree: boolean;
  eip1559?: boolean;
  gasPriority?: "slow" | "average" | "fast";
}

export type GasPrice = { maxFeePerGas: number; maxPriorityFeePerGas: number } | { gasPrice: number };
