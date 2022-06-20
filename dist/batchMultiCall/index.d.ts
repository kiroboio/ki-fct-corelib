import Web3 from "web3";
import Contract from "web3/eth/contract";
import { DecodeTx } from "../interfaces";
import { BatchMultiCallInputInterface, BatchMultiCallInterface, MultiCallInputInterface } from "./interfaces";
export declare class BatchMultiCall {
    calls: Array<BatchMultiCallInterface>;
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
        decodedParams: {};
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
            functionSignature: any;
        };
    }[];
    addBatchCall(tx: BatchMultiCallInputInterface): Promise<BatchMultiCallInterface[]>;
    addMultipleBatchCalls(txs: BatchMultiCallInputInterface[]): Promise<BatchMultiCallInterface[]>;
    editBatchCall(index: number, tx: BatchMultiCallInputInterface): Promise<BatchMultiCallInterface[]>;
    removeBatchCall(index: number): Promise<BatchMultiCallInterface[]>;
    editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiCallInputInterface): Promise<BatchMultiCallInterface[]>;
    removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number): Promise<BatchMultiCallInterface[]>;
}
