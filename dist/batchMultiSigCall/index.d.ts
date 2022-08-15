import { ethers } from "ethers";
import { DecodeTx } from "../interfaces";
import { BatchMSCallInput, BatchMSCall, MSCallInput } from "./interfaces";
export declare class BatchMultiSigCall {
    calls: Array<BatchMSCall>;
    variables: Array<Array<string>>;
    provider: ethers.providers.JsonRpcProvider;
    FactoryProxy: ethers.Contract;
    factoryProxyAddress: string;
    constructor(provider: ethers.providers.JsonRpcProvider, contractAddress: string);
    createVariable(variableId: string, value?: string): string[];
    addVariableValue(variableId: string, value: string): string[];
    removeVariable(variableId: string): Promise<string[]>;
    getVariablesAsBytes32(): string[];
    private getVariableIndex;
    private getVariableFCValue;
    refTxValue(index: number, bytes?: boolean): string;
    addExistingBatchCall(batchCall: BatchMSCall): BatchMSCall[];
    create(tx: BatchMSCallInput): Promise<BatchMSCall>;
    createMultiple(txs: BatchMSCallInput[]): Promise<BatchMSCall[]>;
    editBatchCall(index: number, tx: BatchMSCallInput): Promise<BatchMSCall>;
    removeBatchCall(index: number): Promise<BatchMSCall[]>;
    addMultiCallTx(indexOfBatch: number, tx: MSCallInput): Promise<BatchMSCall>;
    editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MSCallInput): Promise<BatchMSCall>;
    removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number): Promise<BatchMSCall>;
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
