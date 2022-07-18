import Web3 from "web3";
import Contract from "web3/eth/contract";
import { DecodeTx } from "../interfaces";
import { BatchMultiSigCallInputInterface, BatchMultiSigCallInterface, MultiSigCallInputInterface } from "./interfaces";
export declare class BatchMultiSigCall {
    calls: Array<BatchMultiSigCallInterface>;
    variables: object;
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
    addBatchCall(tx: BatchMultiSigCallInputInterface): Promise<BatchMultiSigCallInterface[]>;
    addMultipleBatchCalls(txs: BatchMultiSigCallInputInterface[]): Promise<BatchMultiSigCallInterface[]>;
    editBatchCall(index: number, tx: BatchMultiSigCallInputInterface): Promise<BatchMultiSigCallInterface[]>;
    removeBatchCall(index: number): Promise<BatchMultiSigCallInterface[]>;
    editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiSigCallInputInterface): Promise<BatchMultiSigCallInterface[]>;
    removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number): Promise<BatchMultiSigCallInterface[]>;
    private getMultiSigCallData;
}
