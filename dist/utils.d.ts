import { Transaction, TransactionObject } from "web3/eth/types";
declare function verifyMessage(message: string, signature: string, address: string): boolean;
declare function decodeSessionId(sessionId: string): {
    group: number;
    nonce: number;
    afterTimestamp: number;
    beforeTimestamp: number;
    gasLimit: number;
    maxGasPrice: number;
    flags: string;
};
declare const _default: {
    verifyMessage: typeof verifyMessage;
    decodeSessionId: typeof decodeSessionId;
    transactionValidator: (transaction: TransactionObject<Transaction>, rpcUrl: string, activatorPrivateKey: string, factoryProxyAddress: string) => Promise<void>;
};
export default _default;
