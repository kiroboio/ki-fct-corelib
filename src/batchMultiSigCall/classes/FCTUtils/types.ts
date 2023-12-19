export interface PayerPayment {
  payer: string;
  gas: bigint;
  ethCost: bigint;
  pureEthCost: bigint;
  // kiroCost: bigint;
}

export interface ITxTrace {
  calls: {
    method: string;
    value: string;
    inputData: Array<any>;
    error: string | null;
    id: string;
  }[];
  validations: {
    id: string;
  }[];
  computed: {
    id: string;
  }[];
}
