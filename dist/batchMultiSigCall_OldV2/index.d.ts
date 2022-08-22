import { ethers } from "ethers";
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
    getVariableIndex(variableId: string, throwError?: boolean): number;
    getVariableFCValue(variableId: string): string;
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
}
