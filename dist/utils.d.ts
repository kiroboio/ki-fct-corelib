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
    decodeSessionId: typeof decodeSessionId;
    getEncodedData: (types: string[], values: string[]) => {
        eipMessage: string;
        abiEncodedMessage: string;
    };
};
export default _default;
