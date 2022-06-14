import Web3 from "web3";
import Contract from "web3/eth/contract";
import { BatchCallInputInterface, BatchCallInterface } from "./interfaces";
export declare class BatchCallPacked {
    calls: Array<BatchCallInterface>;
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
    addTx(tx: BatchCallInputInterface): Promise<BatchCallInterface[]>;
    addMultipleTx(txs: BatchCallInputInterface[]): Promise<{
        to: string;
        value: string;
        signer: string;
        sessionId: string;
        data: string;
        hashedData: string;
        unhashedCall: BatchCallInputInterface;
    }[]>;
    editTx(index: number, tx: BatchCallInputInterface): Promise<BatchCallInterface[]>;
    removeTx(index: number): Promise<BatchCallInterface[]>;
}
