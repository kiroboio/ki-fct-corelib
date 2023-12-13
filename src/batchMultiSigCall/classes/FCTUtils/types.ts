export interface PayerPayment {
  payer: string;
  gas: bigint;
  ethCost: bigint;
  pureEthCost: bigint;
  // kiroCost: bigint;
}
