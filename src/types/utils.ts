export interface ITxValidator {
  rpcUrl: string;
  callData: string;
  activator: string;
  actuatorContractAddress: string;
  activateForFree: boolean;
  gasPrice: EIP1559GasPrice;
  errorIsValid?: boolean;
}

export interface EIP1559GasPrice {
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}
