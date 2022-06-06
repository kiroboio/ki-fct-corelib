import Web3 from "web3";
import Contract from "web3/eth/contract";
interface BatchFlags {
    staticCall?: boolean;
    cancelable?: boolean;
    payment?: boolean;
}
interface MultiCallFlags {
    viewOnly: boolean;
    continueOnFail: boolean;
    stopOnFail: boolean;
    stopOnSuccess: boolean;
    revertOnSuccess: boolean;
}
interface MultiSigCallInputData {
    value: string;
    to: string;
    signer: string;
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
interface BatchMultiSigCallInputData {
    groupId: number;
    nonce: number;
    signers: string[];
    signerPrivateKeys?: string[];
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: BatchFlags;
    multiCalls: MultiSigCallInputData[];
}
interface MultiSigCall {
    typeHash: Uint8Array;
    functionSignature: string;
    value: string;
    signer: string;
    gasLimit: number;
    flags: string;
    to: string;
    ensHash?: string;
    data: string;
}
interface Signature {
    r: string;
    s: string;
    v: string;
}
interface BatchMultiSigCallData {
    typeHash: Uint8Array;
    sessionId: string;
    signatures: Signature[];
    mcall: MultiSigCall[];
}
export declare class BatchMultiSigCall {
    calls: Array<BatchMultiSigCallData>;
    web3: Web3;
    FactoryProxy: Contract;
    factoryProxyAddress: string;
    constructor(web3: Web3, contractAddress: string);
    addBatchCall(tx: BatchMultiSigCallInputData): Promise<BatchMultiSigCallData[]>;
    addMultipleBatchCalls(txs: BatchMultiSigCallInputData[]): Promise<BatchMultiSigCallData[]>;
    execute(activator: string, groupId: number): Promise<any>;
}
export {};
