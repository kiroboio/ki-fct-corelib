declare enum Method {
    batchCall = "batchCall_",
    batchCallPacked = "batchCallPacked_",
    batchTransfer = "batchTransfer_",
    batchTransferPacked = "batchTransferPacked_",
    batchMultiCall = "batchMultiCall_",
    batchMultiCallPacked = "batchMultiCallPacked_",
    batchMultiSigCall = "batchMultiSigCall_",
    batchMultiSigCallPacked = "batchMultiSigCallPacked_"
}
declare type method = keyof typeof Method;
interface transactionValidatorInterface {
    calls: any[];
    method: method;
    groupId: number;
    silentRevert: boolean;
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
