import Web3 from "web3";
import Contract from "web3/eth/contract";
import { BatchMultiCallData, BatchMultiCallInputData, DecodeTx, MultiCallInputData } from "./interfaces";
export declare class BatchMultiCall {
    calls: Array<BatchMultiCallData>;
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
    addBatchCall(tx: BatchMultiCallInputData): Promise<BatchMultiCallData[]>;
    addMultipleBatchCalls(txs: BatchMultiCallInputData[]): Promise<BatchMultiCallData[]>;
    editBatchCall(index: number, tx: BatchMultiCallInputData): Promise<BatchMultiCallData[]>;
    removeBatchCall(index: number): Promise<BatchMultiCallData[]>;
    editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiCallInputData): Promise<BatchMultiCallData[]>;
    removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number): Promise<BatchMultiCallData[]>;
}
