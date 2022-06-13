import Web3 from "web3";
import Contract from "web3/eth/contract";
import { MultiCallInput, MultiCallPacked, MultiCallPackedInput } from "./interfaces";
export declare class BatchMultiCallPacked {
    calls: Array<MultiCallPacked>;
    web3: Web3;
    FactoryProxy: Contract;
    constructor(web3: Web3, contractAddress: string);
    decodeBatch(encodedData: string): any;
    addPackedMulticall(tx: MultiCallPackedInput): Promise<MultiCallPacked[]>;
    addMultiplePackedMulticalls(txs: MultiCallPackedInput[]): Promise<MultiCallPacked[]>;
    editBatchCall(index: number, tx: MultiCallPackedInput): Promise<MultiCallPacked[]>;
    removeBatchCall(index: number): Promise<MultiCallPacked[]>;
    editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiCallInput): Promise<MultiCallPacked[]>;
    removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number): Promise<MultiCallPacked[]>;
}
