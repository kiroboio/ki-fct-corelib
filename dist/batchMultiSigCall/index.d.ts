import Web3 from "web3";
import Contract from "web3/eth/contract";
import { BatchMultiSigCallData, BatchMultiSigCallInputData, DecodeTx, MultiSigCallInputData } from "./interfaces";
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
    editBatchCall(index: number, tx: BatchMultiSigCallInputData): Promise<BatchMultiSigCallData[]>;
    removeBatchCall(index: number): Promise<BatchMultiSigCallData[]>;
    editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiSigCallInputData): Promise<BatchMultiSigCallData[]>;
    removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number): Promise<BatchMultiSigCallData[]>;
}
