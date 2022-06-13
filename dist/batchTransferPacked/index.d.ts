import Web3 from "web3";
import Contract from "web3/eth/contract";
import { Transfer, TransferCall } from "./interfaces";
export declare class BatchTransferPacked {
    calls: Array<Transfer>;
    web3: Web3;
    FactoryProxy: Contract;
    constructor(web3: Web3, contractAddress: string);
    decodeData(data: string): {
        token: any;
        to: any;
        value: any;
        sessionId: any;
    };
    addTx(tx: TransferCall): Promise<Transfer[]>;
    addMultipleTx(tx: TransferCall[]): Promise<Transfer[]>;
    editTx(index: number, tx: TransferCall): Promise<Transfer[]>;
    removeTx(index: number): Promise<Transfer[]>;
}
