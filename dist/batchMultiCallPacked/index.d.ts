import Web3 from "web3";
import Contract from "web3/eth/contract";
import { BatchMultiCallPackedInputInterface, BatchMultiCallPackedInterface, MultiCallInputInterface } from "./interfaces";
export declare class BatchMultiCallPacked {
    calls: Array<BatchMultiCallPackedInterface>;
    web3: Web3;
    FactoryProxy: Contract;
    constructor(web3: Web3, contractAddress: string);
    decodeBatch(encodedData: string): any;
    addBatchCall(tx: BatchMultiCallPackedInputInterface): Promise<BatchMultiCallPackedInterface[]>;
    addMultipleBatchCalls(txs: BatchMultiCallPackedInputInterface[]): Promise<BatchMultiCallPackedInterface[]>;
    editBatchCall(index: number, tx: BatchMultiCallPackedInputInterface): Promise<BatchMultiCallPackedInterface[]>;
    removeBatchCall(index: number): Promise<BatchMultiCallPackedInterface[]>;
    editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiCallInputInterface): Promise<BatchMultiCallPackedInterface[]>;
    removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number): Promise<BatchMultiCallPackedInterface[]>;
}
