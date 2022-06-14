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

// For multiBatchCalls
export interface BatchFlags {
  staticCall: boolean;
  cancelable: boolean;
  payment: boolean;
  eip712: boolean;
  flow: boolean;
}

// For multiCalls in batchMultiCalls
export interface MultiCallFlags {
  viewOnly: boolean;
  onFailStop: boolean;
  onFailContinue: boolean;
  onSuccessStop: boolean;
  onSuccessRevert: boolean;
}
