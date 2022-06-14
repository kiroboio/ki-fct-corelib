import Web3 from "web3";
import Contract from "web3/eth/contract";
import { TransferInputInterface, TransferInterface } from "./interfaces";
export declare class BatchTransfer {
    calls: Array<TransferInterface>;
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
    addTx(tx: TransferInputInterface): Promise<TransferInterface[]>;
    addMultipleTx(txs: TransferInputInterface[]): Promise<TransferInterface[]>;
    editTx(index: number, tx: TransferInputInterface): Promise<TransferInterface[]>;
    removeTx(index: number): Promise<TransferInterface[]>;
}
