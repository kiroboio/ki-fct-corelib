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
};
export default _default;
