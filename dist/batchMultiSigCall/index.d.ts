import Web3 from "web3";
import Contract from "web3/eth/contract";
interface Params {
    name: string;
    type: string;
    value: string;
}
interface DecodeTx {
    encodedData: string;
    encodedDetails: string;
    params?: Params[];
}
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
    method?: string;
    data?: string;
    params?: Params[];
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
    encodedData: string;
    encodedDetails: string;
}
interface BatchMultiSigCallData {
    typeHash: Uint8Array;
    sessionId: string;
    typedData: object;
    encodedMessage: string;
    encodedLimits: string;
    mcall: MultiSigCall[];
}
export declare class BatchMultiSigCall {
    calls: Array<BatchMultiSigCallData>;
    web3: Web3;
    FactoryProxy: Contract;
    factoryProxyAddress: string;
    constructor(web3: Web3, contractAddress: string);
    decodeLimits(encodedLimits: string): {
        nonce: any;
        payment: any;
        afterTimestamp: any;
        beforeTimestamp: any;
        maxGasPrice: any;
    };
    decodeTransactions(txs: DecodeTx[]): {
        typeHash: any;
        txHash: any;
        transaction: {
            signer: any;
            to: any;
            toEnsHash: any;
            value: any;
            gasLimit: any;
            staticCall: any;
            continueOnFail: any;
            stopOnFail: any;
            stopOnSuccess: any;
            revertOnSuccess: any;
            methodHash: any;
        };
    }[];
    addBatchCall(tx: BatchMultiSigCallInputData): Promise<BatchMultiSigCallData[]>;
    addMultipleBatchCalls(txs: BatchMultiSigCallInputData[]): Promise<BatchMultiSigCallData[]>;
    execute(activator: string, groupId: number): Promise<any>;
}
export {};
