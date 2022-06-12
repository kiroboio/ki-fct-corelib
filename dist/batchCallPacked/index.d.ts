import Web3 from "web3";
import Contract from "web3/eth/contract";
import { BatchCallInputData, BatchCallPackedData } from "./interfaces";
export declare class BatchCallPacked {
    calls: Array<BatchCallPackedData>;
    web3: Web3;
    FactoryProxy: Contract;
    constructor(web3: Web3, contractAddress: string);
    verifyMessage(message: string, signature: string, address: string): boolean;
    decodeData(data: string): {
        to: any;
        value: any;
        sessionId: any;
        data: any;
    };
    addTx(tx: BatchCallInputData): Promise<BatchCallPackedData[]>;
    addMultipleTx(txs: BatchCallInputData[]): Promise<{
        to: string;
        value: string;
        signer: string;
        sessionId: string;
        data: string;
        hashedData: string;
        unhashedCall: BatchCallInputData;
    }[]>;
    editTx(index: number, tx: BatchCallInputData): Promise<BatchCallPackedData[]>;
    removeTx(index: number): Promise<BatchCallPackedData[]>;
}
