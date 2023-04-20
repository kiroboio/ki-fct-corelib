export interface ITxValidator {
    rpcUrl: string;
    callData: string;
    actuatorPrivateKey: string;
    actuatorContractAddress: string;
    activateForFree: boolean;
    gasPrice: EIP1559GasPrice;
    errorIsValid?: boolean;
}
export interface EIP1559GasPrice {
    maxFeePerGas: number;
    maxPriorityFeePerGas: number;
}
