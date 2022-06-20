import Web3 from "web3";
import Contract from "web3/eth/contract";
import { BatchCallInputInterface, BatchCallInterface } from "./interfaces";
import { Params } from "../interfaces";
export declare class BatchCall {
    calls: Array<BatchCallInterface>;
    web3: Web3;
    FactoryProxy: Contract;
    factoryProxyAddress: string;
    constructor(web3: Web3, contractAddress: string);
    decodeData(data: string, txData: string, params?: Params[]): {
        decodedParams: {};
        typeHash: any;
        txHash: any;
        transaction: {
            to: any;
            toEnsHash: any;
            value: any;
            nonce: any;
            afterTimestamp: any;
            beforeTimestamp: any;
            gasLimit: any;
            maxGasPrice: any;
            staticCall: any;
            payment: any;
            methodHash: any;
        };
    };
    addTx(tx: BatchCallInputInterface): Promise<BatchCallInterface[]>;
    addMultipleTx(txs: BatchCallInputInterface[]): Promise<BatchCallInterface[]>;
    editTx(index: number, tx: BatchCallInputInterface): Promise<BatchCallInterface[]>;
    removeTx(index: number): Promise<BatchCallInterface[]>;
}
