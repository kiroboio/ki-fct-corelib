export interface Params {
    name: string;
    type: string;
    value: string;
}
export interface DecodeTx {
    encodedData: string;
    encodedDetails: string;
    params?: Params[];
}
export interface BatchFlags {
    staticCall: boolean;
    cancelable: boolean;
    payment: boolean;
    eip712: boolean;
    flow: boolean;
}
export interface MultiCallFlags {
    viewOnly: boolean;
    onFailStop: boolean;
    onFailContinue: boolean;
    onSuccessStop: boolean;
    onSuccessRevert: boolean;
}
