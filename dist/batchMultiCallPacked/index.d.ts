import Web3 from "web3";
import Contract from "web3/eth/contract";
interface TransferFlags {
    staticCall?: boolean;
    cancelable?: boolean;
    payment?: boolean;
    flow?: boolean;
}
interface MultiCallInput {
    value: string;
    to: string;
    data: string;
    gasLimit?: number;
    onFailStop?: boolean;
    onFailContinue?: boolean;
    onSuccessStop?: boolean;
    onSuccessRevert?: boolean;
}
interface MultiCallPackedInput {
    groupId: number;
    nonce: number;
    signer: string;
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: TransferFlags;
    mcall: MultiCallInput[];
}
interface MultiCall {
    value: string;
    to: string;
    gasLimit: number;
    flags: string;
    data: string;
}
interface MultiCallPacked {
    encodedData: string;
    sessionId: string;
    signer: string;
    mcall: MultiCall[];
}
export declare class BatchMultiCallPacked {
    calls: Array<MultiCallPacked>;
    web3: Web3;
    FactoryProxy: Contract;
    constructor(web3: Web3, contractAddress: string);
    decodeBatch(encodedData: string): any;
    addPackedMulticall(tx: MultiCallPackedInput): Promise<MultiCallPacked[]>;
    addMultiplePackedMulticalls(txs: MultiCallPackedInput[]): Promise<MultiCallPacked[]>;
}
export {};
