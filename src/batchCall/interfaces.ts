import { BatchCallBase, Params } from "../interfaces";

export interface BatchCallInputInterface extends BatchCallBase {
  value: string;
  to: string;
  toEns?: string;
  signer: string;
  method?: string;
  params?: Params[];
}

export interface BatchCallInterface {
  typeHash: string;
  to: string;
  ensHash: string;
  value: string;
  sessionId: string;
  signer: string;
  functionSignature: string;
  data: string;
  typedData: Object;
  encodedMessage: string;
  encodedTxMessage: string;
  inputData: BatchCallInputInterface;
}
