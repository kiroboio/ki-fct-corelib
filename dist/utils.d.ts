declare enum Method {
    batchCall = 0,
    batchCallPacked = 1,
    batchTransfer = 2,
    batchTransferPacked = 3,
    batchMultiCall = 4,
    batchMultiCallPacked = 5,
    batchMultiSigCall = 6,
    batchMultiSigCallPacked = 7
}
declare type method = keyof typeof Method;
interface transactionValidatorInterface {
    calls: any[];
    method: method;
    groupId: number;
    silentRevert?: boolean;
    rpcUrl: string;
    activatorPrivateKey: string;
    factoryProxyAddress: string;
}
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
    transactionValidator: (transactionValidatorInterface: transactionValidatorInterface) => Promise<{
        isValid: boolean;
        gasUsed: number;
    }>;
};
export default _default;
