import { BatchCallBase, Params } from "../interfaces";

export interface BatchCallInputInterface extends BatchCallBase {
  value: string;
  to: string;
  data: string;
  method: string;
  params: Params[];
  signer: string;
  groupId: number;
  nonce: number;
}

export interface BatchCallInterface {
  to: string;
  value: string;
  sessionId: string;
  signer: string;
  data: string;
  hashedData: string;
  unhashedCall: BatchCallInputInterface;
}
