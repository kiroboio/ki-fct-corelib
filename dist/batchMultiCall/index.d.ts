import Web3 from "web3";
import Contract from "web3/eth/contract";
interface MultiCallFlags {
    viewOnly: boolean;
    continueOnFail: boolean;
    stopOnFail: boolean;
    stopOnSuccess: boolean;
    revertOnSuccess: boolean;
}
interface BatchFlags {
    staticCall?: boolean;
    cancelable?: boolean;
    payment?: boolean;
}
interface MultiCallInputData {
    value: string;
    to: string;
    data?: string;
    methodInterface?: string;
    methodData?: Object;
    toEnsHash?: string;
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: MultiCallFlags;
}
interface BatchMultiCallInputData {
    groupId: number;
    nonce: number;
    signer: string;
    signerPrivateKey?: string;
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: BatchFlags;
    multiCalls: MultiCallInputData[];
}
interface MultiCall {
    value: string;
    to: string;
    data: string;
    ensHash: string;
    typeHash: Uint8Array;
    flags: string;
    functionSignature: string;
    gasLimit: number;
}
interface BatchMultiCallData {
    r: string;
    s: string;
    typeHash: Uint8Array;
    sessionId: string;
    signer: string;
    v: string;
    mcall: MultiCall[];
}
export declare class BatchMultiCall {
    calls: Array<BatchMultiCallData>;
    web3: Web3;
    FactoryProxy: Contract;
    factoryProxyAddress: string;
    constructor(web3: Web3, contractAddress: string);
    addBatchCall(tx: BatchMultiCallInputData): Promise<BatchMultiCallData[]>;
    addMultipleBatchCalls(txs: BatchMultiCallInputData[]): Promise<BatchMultiCallData[]>;
    execute(activator: string, groupId: number): Promise<any>;
}
export {};
