import Web3 from "web3";
import Contract from "web3/eth/contract";
interface TransferFlags {
    eip712?: boolean;
    staticCall?: boolean;
    cancelable?: boolean;
    payment?: boolean;
}
interface TransferCall {
    token: string;
    tokenEnsHash?: string;
    to: string;
    toEnsHash?: string;
    groupId: number;
    nonce: number;
    value: number;
    signer: string;
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: TransferFlags;
}
interface Transfer {
    token: string;
    tokenEnsHash: string;
    to: string;
    toEnsHash: string;
    value: number;
    signer: string;
    sessionId: string;
    typedData: object;
    hashedData: string;
    unhashedCall: TransferCall;
}
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
export {};
