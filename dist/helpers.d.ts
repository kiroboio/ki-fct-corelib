export declare const getGroupId: (group: number) => string;
export declare const getNonce: (nonce: number) => string;
export declare const getAfterTimestamp: (epochDate: number) => string;
export declare const getBeforeTimestamp: (infinity: boolean, epochDate?: number) => string;
export declare const getMaxGas: (maxGas: number) => string;
export declare const getMaxGasPrice: (gasPrice: number) => string;
export declare const getFlags: (flags: any, small: boolean) => string;
export declare const manageCallFlags: (flags: any) => string;
