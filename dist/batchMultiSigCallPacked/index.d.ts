import Web3 from "web3";
import Contract from "web3/eth/contract";
import { BatchMultiSigCallPackedData, BatchMultiSigCallPackedInput, CallInput } from "./interfaces";
export declare class BatchMultiSigCallPacked {
    calls: Array<BatchMultiSigCallPackedData>;
    web3: Web3;
    FactoryProxy: Contract;
    constructor(web3: Web3, contractAddress: string);
    decodeLimits(encodedLimits: string): {
        sessionId: any;
    };
    decodeTxs(encodedTxs: string[]): {
        signer: any;
        to: any;
        value: any;
        gasLimit: any;
        flags: any;
        data: any;
    }[];
    addPackedMulticall(tx: BatchMultiSigCallPackedInput): Promise<BatchMultiSigCallPackedData[]>;
    addMultiplePackedMulticall(txs: BatchMultiSigCallPackedInput[]): Promise<BatchMultiSigCallPackedData[]>;
    editBatchCall(index: number, tx: BatchMultiSigCallPackedInput): Promise<BatchMultiSigCallPackedData[]>;
    removeBatchCall(index: number): Promise<BatchMultiSigCallPackedData[]>;
    editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: CallInput): Promise<BatchMultiSigCallPackedData[]>;
    removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number): Promise<BatchMultiSigCallPackedData[]>;
}
