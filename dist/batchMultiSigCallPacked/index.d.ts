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
    addBatchCall(tx: BatchMultiSigCallPackedInputInterface): Promise<BatchMultiSigCallPackedInterface[]>;
    addMultipleBatchCalls(txs: BatchMultiSigCallPackedInputInterface[]): Promise<BatchMultiSigCallPackedInterface[]>;
    editBatchCall(index: number, tx: BatchMultiSigCallPackedInputInterface): Promise<BatchMultiSigCallPackedInterface[]>;
    removeBatchCall(index: number): Promise<BatchMultiSigCallPackedInterface[]>;
    editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiSigCallPackedInputInterface): Promise<BatchMultiSigCallPackedInterface[]>;
    removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number): Promise<BatchMultiSigCallPackedInterface[]>;
}
