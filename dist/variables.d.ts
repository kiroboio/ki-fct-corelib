import { Variable } from "interfaces";
export declare type GlobalVariable = "blockNumber" | "blockTimestamp" | "gasPrice" | "minerAddress" | "activatorAddress" | "blockHash" | string;
declare const _default: {
    getBlockNumber: () => Variable;
    getBlockTimestamp: () => Variable;
    getGasPrice: () => Variable;
    getMinerAddress: () => Variable;
    getActivatorAddress: () => Variable;
    globalVariables: {
        blockNumber: string;
        blockTimestamp: string;
        gasPrice: string;
        minerAddress: string;
        activatorAddress: string;
        blockHash: string;
    };
};
export default _default;
