import Web3 from "web3";
import Contract from "web3/eth/contract";
interface Flags {
    staticCall?: boolean;
    cancelable?: boolean;
    payment?: boolean;
}
interface BatchCallInputData {
    value: string;
    to: string;
    data: string;
    signer: string;
    groupId: number;
    nonce: number;
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: Flags;
}
interface BatchCallPackedData {
    to: string;
    value: string;
    sessionId: string;
    signer: string;
    data: string;
    hashedData: string;
}
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
    }[]>;
}
export {};
