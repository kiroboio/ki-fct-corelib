import Web3 from "web3";
import Contract from "web3/eth/contract";
interface Flags {
    staticCall?: boolean;
    cancelable?: boolean;
    payment?: boolean;
}
interface Params {
    name: string;
    type: string;
    value: string;
}
interface BatchCallInputData {
    value: string;
    to: string;
    toEnsHash?: string;
    signer: string;
    groupId: number;
    nonce: number;
    data?: string;
    method?: string;
    params?: Params[];
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: Flags;
}
interface BatchCallData {
    typeHash: string;
    to: string;
    ensHash: string;
    value: string;
    sessionId: string;
    signer: string;
    functionSignature: string;
    data: string;
    typedData: Object;
    hashedMessage: string;
    hashedTxMessage: string;
}
export declare class BatchCall {
    calls: Array<BatchCallData>;
    web3: Web3;
    FactoryProxy: Contract;
    factoryProxyAddress: string;
    constructor(web3: Web3, contractAddress: string);
    verifyMessage(message: string, signature: string, address: string): boolean;
    decodeData(data: string, txData: string, params?: any): any;
    addTx(tx: BatchCallInputData): Promise<BatchCallData[]>;
    addMultipleTx(txs: BatchCallInputData[]): Promise<{
        typeHash: string;
        to: string;
        ensHash: string;
        value: string;
        sessionId: string;
        signer: string;
        functionSignature: string;
        data: string;
        typedData: {
            types: {
                EIP712Domain: {
                    name: string;
                    type: string;
                }[];
                BatchCall_: any[];
                Transaction_: {
                    name: string;
                    type: string;
                }[];
            };
            primaryType: string;
            domain: {
                name: any;
                version: any;
                chainId: number;
                verifyingContract: string;
                salt: any;
            };
            message: {
                transaction: {
                    call_address: string;
                    call_ens: string;
                    eth_value: string;
                    nonce: string;
                    valid_from: number;
                    expires_at: number;
                    gas_limit: number;
                    gas_price_limit: number;
                    view_only: boolean;
                    refund: boolean;
                    method_interface: string;
                };
            };
        };
        hashedMessage: string;
        hashedTxMessage: string;
    }[]>;
}
export {};
