import { getGasPrices } from "../utils/gas";
export type GasPriority = keyof Awaited<ReturnType<typeof getGasPrices>>;
export interface ITxValidator {
    rpcUrl: string;
    callData: string;
    actuatorPrivateKey: string;
    actuatorContractAddress: string;
    activateForFree: boolean;
    gasPrice: EIP1559GasPrice;
}
export interface EIP1559GasPrice {
    maxFeePerGas: number;
    maxPriorityFeePerGas: number;
}
export interface LegacyGasPrice {
    gasPrice: number;
}
export type GasPrice = EIP1559GasPrice | LegacyGasPrice;
