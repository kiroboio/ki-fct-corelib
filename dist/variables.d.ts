import { Variable } from "interfaces";
export declare type GlobalVariable = "blockNumber" | "blockTimestamp" | "gasPrice" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | string;
declare const _default: {
    getBlockNumber: () => Variable;
    getBlockTimestamp: () => Variable;
    getGasPrice: () => Variable;
    getMinerAddress: () => Variable;
    getOriginAddress: () => Variable;
    getInvestorAddress: () => Variable;
    getActivatorAddress: () => Variable;
    getEngineAddress: () => Variable;
    globalVariables: {
        blockNumber: string;
        blockTimestamp: string;
        gasPrice: string;
        minerAddress: string;
        originAddress: string;
        investorAddress: string;
        activatorAddress: string;
        engineAddress: string;
    };
};
export default _default;
