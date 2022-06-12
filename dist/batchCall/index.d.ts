import Web3 from "web3";
import Contract from "web3/eth/contract";
import { Params } from "../interfaces";
import { BatchCallData, BatchCallInputData } from "./interfaces";
export declare class BatchCall {
    unhashedCalls: Array<BatchCallInputData>;
    calls: Array<BatchCallData>;
    web3: Web3;
    FactoryProxy: Contract;
    factoryProxyAddress: string;
    constructor(web3: Web3, contractAddress: string);
    decodeData(data: string, txData: string, params?: Params[]): {
        typeHash: any;
        txHash: any;
        transaction: {
            to: any;
            toEnsHash: any;
            value: any;
            nonce: any;
            afterTimestamp: any;
            beforeTimestamp: any;
            maxGas: any;
            maxGasPrice: any;
            staticCall: any;
            payment: any;
            methodHash: any;
        };
    };
    addTx(tx: BatchCallInputData): Promise<BatchCallData[]>;
    addMultipleTx(txs: BatchCallInputData[]): Promise<BatchCallData[]>;
    editTx(index: number, tx: BatchCallInputData): Promise<BatchCallData[]>;
    removeTx(index: number): Promise<BatchCallData[]>;
}
