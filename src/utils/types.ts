import { BatchMultiSigCallTypedData, MSCall } from "../batchMultiSigCall/types";
import { getGasPrices } from "./gas";

export interface IFCT {
  typedData: BatchMultiSigCallTypedData;
  mcall: MSCall[];
}

export type GasPriority = keyof Awaited<ReturnType<typeof getGasPrices>>;

export interface ITxValidator {
  rpcUrl: string;
  callData: string;
  actuatorPrivateKey: string;
  actuatorContractAddress: string;
  activateForFree: boolean;
  eip1559?: boolean;
  gasPriority?: GasPriority;
}

export interface EIP1559GasPrice {
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
}
export interface LegacyGasPrice {
  gasPrice: number;
}

export type GasPrice = EIP1559GasPrice | LegacyGasPrice;
