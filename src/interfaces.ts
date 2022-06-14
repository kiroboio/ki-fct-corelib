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

// For multiCalls in batchMultiCalls
export interface MultiCallFlags {
  viewOnly: boolean;
  onFailStop: boolean;
  onFailContinue: boolean;
  onSuccessStop: boolean;
  onSuccessRevert: boolean;
}

export interface MethodParamsInterface {
  method: string;
  params: Params[];
}

export interface ContractInteractionInterface {
  name: string;
  type: string;
}

export interface BatchCallBase {
  groupId: number;
  nonce: number;

  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  flags?: Partial<BatchFlags>;
}

export interface MultiCallBase {
  data?: string;
  method?: string;
  params?: Params[];

  gasLimit?: number;
  flags?: Partial<MultiCallFlags>;
}
