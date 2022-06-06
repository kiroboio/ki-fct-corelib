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
    signerPrivateKey?: string;
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
    r: string;
    s: string;
    sessionId: string;
}
export declare class BatchTransfer {
    calls: Array<Transfer>;
    web3: Web3;
    FactoryProxy: Contract;
    factoryProxyAddress: string;
    constructor(web3: Web3, contractAddress: string);
    addTx(tx: TransferCall): Promise<Transfer[]>;
    addMultipleTx(txs: TransferCall[]): Promise<Transfer[]>;
    execute(activator: string, groupId: number, silentRevert: boolean): Promise<any>;
}
export {};
