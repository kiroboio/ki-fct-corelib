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
    isSuccess: boolean;
    id: string;
  }[];
  validations: {
    id: string;
  }[];
  computed: {
    id: string;
  }[];
}

export interface ISimpleTxTrace {
  calls: {
    isSuccess: boolean;
    id: string;
  }[];
  validations: ITxTrace["validations"];
  computed: ITxTrace["computed"];
}
