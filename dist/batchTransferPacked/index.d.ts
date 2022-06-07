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
    token: string;
    to: string;
    value: number;
    sessionId: string;
    hashedData: string;
}
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
}
export {};
