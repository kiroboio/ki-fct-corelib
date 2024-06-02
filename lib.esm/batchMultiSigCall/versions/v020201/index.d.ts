import { MessageTypeProperty } from "@metamask/eth-sig-util";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { Version_old } from "../oldVersion";
import { SessionId_020201 } from "./SessionId";
export declare class Version_020201 extends Version_old {
    SessionId: SessionId_020201;
    constructor(FCT?: BatchMultiSigCall);
    Limits: MessageTypeProperty[];
    getLimitsMessage(FCT: BatchMultiSigCall): Record<string, any>;
}
//# sourceMappingURL=index.d.ts.map