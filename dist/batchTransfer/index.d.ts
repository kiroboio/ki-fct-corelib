import Web3 from "web3";
import Contract from "web3/eth/contract";
import { Transfer, TransferCall } from "./interfaces";
export declare class BatchTransfer {
    calls: Array<Transfer>;
    web3: Web3;
    FactoryProxy: Contract;
    factoryProxyAddress: string;
    constructor(web3: Web3, contractAddress: string);
    decodeData(data: string): {
        token: any;
        tokenEnsHash: any;
        to: any;
        toEnsHash: any;
        value: any;
        nonce: any;
        afterTimestamp: any;
        beforeTimestamp: any;
        maxGas: any;
        maxGasPrice: any;
        payable: any;
    };
    addTx(tx: TransferCall): Promise<Transfer[]>;
    addMultipleTx(txs: TransferCall[]): Promise<Transfer[]>;
    editTx(index: number, tx: TransferCall): Promise<Transfer[]>;
    removeTx(index: number): Promise<Transfer[]>;
}
