import Web3 from "web3";
import Contract from "web3/eth/contract";
interface BatchFlags {
    staticCall?: boolean;
    cancelable?: boolean;
    payment?: boolean;
    flow?: boolean;
}
interface MultiCallFlags {
    viewOnly: boolean;
    continueOnFail: boolean;
    stopOnFail: boolean;
    stopOnSuccess: boolean;
    revertOnSuccess: boolean;
}
interface CallInput {
    value: string;
    to: string;
    data: string;
    signer: string;
    gasLimit?: number;
    flags?: MultiCallFlags;
}
interface BatchMultiSigCallPackedInput {
    groupId: number;
    nonce: number;
    signers: string[];
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: BatchFlags;
    multiCalls: CallInput[];
}
interface Signature {
    r: string;
    s: string;
    v: string;
}
interface PackedMSCall {
    value: string;
    signer: string;
    gasLimit: number;
    flags: string;
    to: string;
    data: string;
}
interface BatchMultiSigCallPackedData {
    sessionId: string;
    signatures: Signature[];
    mcall: PackedMSCall[];
}
export declare class BatchMultiSigCallPacked {
    calls: Array<BatchMultiSigCallPackedData>;
    web3: Web3;
    FactoryProxy: Contract;
    constructor(web3: Web3, contractAddress: string);
    addPackedMulticall(tx: BatchMultiSigCallPackedInput): Promise<BatchMultiSigCallPackedData[]>;
    addMultiplePackedMulticall(txs: BatchMultiSigCallPackedInput[]): Promise<BatchMultiSigCallPackedData[]>;
    execute(activator: string, groupId: number): Promise<any>;
}
export {};
