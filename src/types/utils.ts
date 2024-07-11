import { BatchMultiSigCall } from "../batchMultiSigCall";

export interface ITxValidator {
  rpcUrl: string;
  callData: string;
  activator: string;
  actuatorContractAddress: string;
  activateForFree: boolean;
  gasPrice: EIP1559GasPrice;
  errorIsValid?: boolean;
  version?: string;
}

export interface ITxValidatorV2 {
  rpcUrl: string;
  FCT: BatchMultiSigCall;
  optionalExecutionValues?: {
    purgedFCT?: string;
    investor?: string;
    externalSigners?: string[];
    variables?: string[];
  };
  signatures: any[];
  activator: string;
  actuatorContractAddress: string;
  activateForFree: boolean;
  gasPrice: EIP1559GasPrice;
  errorIsValid?: boolean;
  dryRun?: boolean;
}

export interface EIP1559GasPrice {
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}
