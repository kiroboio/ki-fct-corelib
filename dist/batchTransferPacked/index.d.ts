import Web3 from "web3";
import Contract from "web3/eth/contract";
import { TransferPackedInputInterface, TransferPackedInterface } from "./interfaces";
export declare class BatchTransferPacked {
    calls: Array<TransferPackedInterface>;
    web3: Web3;
    FactoryProxy: Contract;
    constructor(web3: Web3, contractAddress: string);
    decodeData(data: string): {
        token: any;
        to: any;
        value: any;
        sessionId: any;
    };
    addTx(tx: TransferPackedInputInterface): Promise<TransferPackedInterface[]>;
    addMultipleTx(tx: TransferPackedInputInterface[]): Promise<TransferPackedInterface[]>;
    editTx(index: number, tx: TransferPackedInputInterface): Promise<TransferPackedInterface[]>;
    removeTx(index: number): Promise<TransferPackedInterface[]>;
}
