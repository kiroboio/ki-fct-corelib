import { ethers } from "ethers";
import { DecodeTx } from "../interfaces";
import { BatchMultiSigCallInputInterface, BatchMultiSigCallInterface, MultiSigCallInputInterface } from "./interfaces";
export declare class BatchMultiSigCallNew {
    calls: Array<BatchMultiSigCallInterface>;
    variables: Array<Array<string>>;
    provider: ethers.providers.JsonRpcProvider;
    FactoryProxy: ethers.Contract;
    factoryProxyAddress: string;
    constructor(provider: ethers.providers.JsonRpcProvider, contractAddress: string);
    createVariable(variableId: string, value?: string): string[];
    addVariableValue(variableId: string, value: string): string[];
    removeVariable(variableId: string): Promise<string[]>;
    getVariablesAsBytes32(): string[];
    getVariableIndex(variableId: string, throwError?: boolean): number;
    getVariableFCValue(variableId: string): string;
    refTxValue(index: number, bytes?: boolean): string;
    addExistingBatchCall(batchCall: BatchMultiSigCallInterface): BatchMultiSigCallInterface[];
    create(tx: BatchMultiSigCallInputInterface): Promise<BatchMultiSigCallInterface>;
    createMultiple(txs: BatchMultiSigCallInputInterface[]): Promise<BatchMultiSigCallInterface[]>;
    editBatchCall(index: number, tx: BatchMultiSigCallInputInterface): Promise<BatchMultiSigCallInterface>;
    removeBatchCall(index: number): Promise<BatchMultiSigCallInterface[]>;
    addMultiCallTx(indexOfBatch: number, tx: MultiSigCallInputInterface): Promise<BatchMultiSigCallInterface>;
    editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiSigCallInputInterface): Promise<BatchMultiSigCallInterface>;
    removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number): Promise<BatchMultiSigCallInterface>;
    private getMultiSigCallData;
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
            flow: any;
            jump: any;
            methodHash: any;
        };
    }[];
}
