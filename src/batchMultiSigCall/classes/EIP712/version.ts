import { MessageTypeProperty } from "@metamask/eth-sig-util";

import { BatchMultiSigCall } from "../../batchMultiSigCall";

export abstract class EIP712Base {
  abstract getMetaType(): MessageTypeProperty[];
  abstract getEngineType(): MessageTypeProperty[];
  abstract getLimitsType(): MessageTypeProperty[];
  abstract getMetaMessage(FCT: BatchMultiSigCall): Record<string, any>;
  abstract getEngineMessage(FCT: BatchMultiSigCall): Record<string, any>;
  abstract getLimitsMessage(FCT: BatchMultiSigCall): Record<string, any>;
}
