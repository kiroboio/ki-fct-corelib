import { BatchCallBase, BatchFlags } from "../interfaces";
export interface TransferInputInterface extends BatchCallBase {
    to: string;
    toEns?: string;
    value: number;
    token: string;
    tokenEns?: string;
    signer: string;
    flags?: Pick<BatchFlags, "payment">;
}
export interface TransferInterface {
    token: string;
    tokenEnsHash: string;
    to: string;
    toEnsHash: string;
    value: number;
    signer: string;
    sessionId: string;
    typedData: object;
    encodedMessage: string;
    unhashedCall: TransferInputInterface;
}
