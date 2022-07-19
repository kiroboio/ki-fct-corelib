import Web3 from "web3";
import Contract from "web3/eth/contract";
import { BatchMultiSigCallPackedInputInterface, BatchMultiSigCallPackedInterface, MultiSigCallPackedInputInterface } from "./interfaces";
export declare class BatchMultiSigCallPacked {
    calls: Array<BatchMultiSigCallPackedInterface>;
    web3: Web3;
    FactoryProxy: Contract;
    constructor(web3: Web3, contractAddress: string);
    decodeLimits(encodedLimits: string): {
        sessionId: any;
    };
    decodeBatch(encodedLimits: string, encodedTxs: string[]): {
        sessionId: any;
        transactions: {
            signer: any;
            to: any;
            value: any;
            gasLimit: any;
            flags: any;
            data: any;
        }[];
    };
    addBatchCall(tx: BatchMultiSigCallPackedInputInterface): Promise<{
        sessionId: string;
        encodedLimits: string;
        encodedMessage: string;
        inputData: BatchMultiSigCallPackedInputInterface;
        mcall: {
            value: string;
            signer: string;
            gasLimit: number;
            flags: string;
            to: string;
            data: string;
            encodedMessage: string;
        }[];
    }>;
    addMultipleBatchCalls(txs: BatchMultiSigCallPackedInputInterface[]): Promise<{
        sessionId: string;
        encodedLimits: string;
        encodedMessage: string;
        inputData: BatchMultiSigCallPackedInputInterface;
        mcall: {
            value: string;
            signer: string;
            gasLimit: number;
            flags: string;
            to: string;
            data: string;
            encodedMessage: string;
        }[];
    }[]>;
    editBatchCall(index: number, tx: BatchMultiSigCallPackedInputInterface): Promise<{
        sessionId: string;
        encodedLimits: string;
        encodedMessage: string;
        inputData: BatchMultiSigCallPackedInputInterface;
        mcall: {
            value: string;
            signer: string;
            gasLimit: number;
            flags: string;
            to: string;
            data: string;
            encodedMessage: string;
        }[];
    }>;
    removeBatchCall(index: number): Promise<BatchMultiSigCallPackedInterface[]>;
    editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiSigCallPackedInputInterface): Promise<{
        sessionId: string;
        encodedLimits: string;
        encodedMessage: string;
        inputData: BatchMultiSigCallPackedInputInterface;
        mcall: {
            value: string;
            signer: string;
            gasLimit: number;
            flags: string;
            to: string;
            data: string;
            encodedMessage: string;
        }[];
    }>;
    removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number): Promise<{
        sessionId: string;
        encodedLimits: string;
        encodedMessage: string;
        inputData: BatchMultiSigCallPackedInputInterface;
        mcall: {
            value: string;
            signer: string;
            gasLimit: number;
            flags: string;
            to: string;
            data: string;
            encodedMessage: string;
        }[];
    }>;
}
