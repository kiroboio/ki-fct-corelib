import { Variable } from "interfaces";
export declare type GlobalVariable = "blockNumber" | "blockTimestamp" | "gasPrice" | "minerAddress" | "activatorAddress" | "blockHash" | string;
declare const _default: {
    useBlockNumber: () => Variable;
    useBlockTimestamp: () => Variable;
    useGasPrice: () => Variable;
    useMinerAddress: () => Variable;
    useActivatorAddress: () => Variable;
    globalVariables: {
        blockNumber: string;
        blockTimestamp: string;
        gasPrice: string;
        minerAddress: string;
        activatorAddress: string;
    };
};
export default _default;
