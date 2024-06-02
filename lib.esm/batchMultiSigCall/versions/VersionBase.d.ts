import { MessageTypeProperty } from "@metamask/eth-sig-util";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { SessionIdBase } from "./SessionIdBase";
export declare const EIP712Domain: MessageTypeProperty[];
export declare const Meta: MessageTypeProperty[];
export declare const Engine: MessageTypeProperty[];
export declare const Limits: MessageTypeProperty[];
export declare const Computed: MessageTypeProperty[];
export declare const Call: MessageTypeProperty[];
export declare const Recurrency: MessageTypeProperty[];
export declare const Multisig: MessageTypeProperty[];
export declare const Validation: MessageTypeProperty[];
export declare abstract class VersionBase {
    FCT: BatchMultiSigCall | undefined;
    constructor(FCT?: BatchMultiSigCall);
    EIP712Domain: MessageTypeProperty[];
    Meta: MessageTypeProperty[];
    Engine: MessageTypeProperty[];
    Limits: MessageTypeProperty[];
    Computed: MessageTypeProperty[];
    Call: MessageTypeProperty[];
    Recurrency: MessageTypeProperty[];
    Multisig: MessageTypeProperty[];
    Validation: MessageTypeProperty[];
    abstract SessionId: SessionIdBase;
    getMetaMessage(FCT: BatchMultiSigCall): Record<string, any>;
    getEngineMessage(FCT: BatchMultiSigCall): Record<string, any>;
    getLimitsMessage(FCT: BatchMultiSigCall): Record<string, any>;
}
//# sourceMappingURL=VersionBase.d.ts.map