import { BatchCallBase, BatchFlags, Params } from "../interfaces";

export interface BatchCallInputInterface extends BatchCallBase {
  value: string;
  to: string;
  signer: string;
  method?: string;
  params?: Params[];
  flags?: Pick<BatchFlags, "viewOnly" | "payment">;
}

export interface BatchCallInterface {
  to: string;
  value: string;
  sessionId: string;
  signer: string;
  data: string;
  encodedMessage: string;
  inputData: BatchCallInputInterface;
}
