import Web3 from "web3";
import Contract from "web3/eth/contract";
interface TransferFlags {
    staticCall?: boolean;
    cancelable?: boolean;
    payment?: boolean;
}
interface TransferCall {
    token: string;
    to: string;
    value: number;
    signer: string;
    groupId: number;
    nonce: number;
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: TransferFlags;
}
interface Transfer {
    signer: string;
    r: string;
    s: string;
    token: string;
    to: string;
    value: number;
    sessionId: string;
}
export declare class BatchTransferPacked {
    calls: Array<Transfer>;
    web3: Web3;
    FactoryProxy: Contract;
    constructor(web3: Web3, contractAddress: string);
    addTx(tx: TransferCall): Promise<Transfer[]>;
    addMultipleTx(tx: TransferCall[]): Promise<Transfer[]>;
    removeTx(txIndex: number): Transfer[];
    execute(activator: string, groupId: number, silentRevert: boolean): Promise<any>;
}
export {};
