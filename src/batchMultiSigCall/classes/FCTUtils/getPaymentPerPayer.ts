import { MSCall } from "../../types";
import { CallID } from "../CallID";

const fees = {
  beforeCallingBatchMultiSigCall: 5000n,
  FCTControllerOverhead: 43000n,
  gasBeforeEncodedLoop: 3000n,
  gasForEncodingCall: 8000n,
  additionalGasForEncodingCall: 100n,
  FCTControllerRegisterCall: 43000n,
  signatureRecovery: 6000n,
  miscGasBeforeMcallLoop: 1700n,
  mcallOverheadFirstCall: 34000n,
  mcallOverheadOtherCalls: 6250n,
  paymentApproval: 9000n,
  paymentsOutBase: 24500n,
  paymentsOutPerPayment: 1300n,
  totalCallsChecker: 16000n,
  estimateExtraCommmonGasCost: 4000n,
} as const;

const getEncodingMcallCost = (callCount: number) => {
  return (
    BigInt(callCount) * fees.gasForEncodingCall +
    (BigInt(callCount) * BigInt(callCount - 1) * fees.additionalGasForEncodingCall) / 2n
  );
};

const getSignatureRecoveryCost = (signatureCount: number) => {
  return BigInt(signatureCount) * fees.signatureRecovery;
};

const getPaymentsOutCost = (callCount: number) => {
  return fees.paymentsOutBase + BigInt(callCount) * fees.paymentsOutPerPayment;
};

const getExtraCommonGas = (payersCount: number, msgDataLength: number) => {
  return 23100n + 4600n * BigInt(payersCount) + (77600n * BigInt(msgDataLength)) / 10_000n;
};

const getPayers = (calls: MSCall[], pathIndexes: string[]) => {
  // return pathIndexes.map((index) => {
  //   const call = calls[Number(index)];
  //   const { payerIndex } = CallID.parse(call.callId);
  //   return payerIndex === 0 ? ethers.constants.AddressZero : calls[payerIndex - 1].from;
  // });

  return pathIndexes.reduce((acc, pathIndex, index) => {
    const call = calls[Number(index)];
    const { payerIndex } = CallID.parse(call.callId);
    const payer = payerIndex === 0 ? undefined : calls[payerIndex - 1].from;
    // If payer !== undefined AND payer !== lastPayer, add it to the array
    if (payer && payer !== acc[acc.length - 1]) {
      acc.push(payer);
    }
    return acc;
  }, [] as string[]);
};

export function getTotalApprovalCalls(pathIndexes: string[], calls: any[]) {
  // Payer index 0 = actuator pays for the call
  let totalCalls: number;
  const payerList = pathIndexes.map((index) => {
    const call = calls[Number(index)];
    const { payerIndex } = CallID.parse(call.callId);
    return calls[payerIndex - 1].from;
  });

  console.log("payerList", payerList);
}

export function getPayersForRoute({
  calls,
  pathIndexes,
  calldata,
  signatureCount,
}: {
  calls: MSCall[];
  pathIndexes: string[];
  calldata: string;
  signatureCount: number;
}) {
  const batchMultiSigCallOverhead =
    fees.FCTControllerOverhead +
    fees.gasBeforeEncodedLoop +
    getEncodingMcallCost(calls.length) +
    fees.FCTControllerRegisterCall +
    getSignatureRecoveryCost(signatureCount) +
    fees.miscGasBeforeMcallLoop;

  const overhead =
    fees.beforeCallingBatchMultiSigCall +
    batchMultiSigCallOverhead +
    getPaymentsOutCost(calls.length) +
    fees.totalCallsChecker +
    fees.estimateExtraCommmonGasCost;

  const payers = getPayers(calls, pathIndexes);

  const commonGas = getExtraCommonGas(payers.length, calldata.length) + overhead;
  const commonGasPerCall = commonGas / BigInt(payers.length);

  console.log("commonGasPerCall", commonGasPerCall.toString());

  const gasForFCTCall = pathIndexes.reduce((acc, path, index) => {
    const call = calls[Number(path)];
    const { payerIndex, options } = CallID.parse(call.callId);
    const payer = calls[payerIndex - 1].from;
    const overhead = index === 0 ? fees.mcallOverheadFirstCall : fees.mcallOverheadOtherCalls;
    const gas = BigInt(options.gasLimit) || 100_000n;
    const amount = gas + overhead + commonGasPerCall;
    if (acc[payer]) {
      acc[payer] += amount;
    } else {
      acc[payer] = amount;
    }
    return acc;
  }, {} as Record<string, bigint>);

  const gasForPaymentApprovals = payers.reduce((acc, address) => {
    if (acc[address]) {
      acc[address] += fees.paymentApproval;
    } else {
      acc[address] = fees.paymentApproval;
    }
    return acc;
  }, {} as Record<string, bigint>);

  return [...new Set(payers)].map((payer) => {
    return {
      payer,
      gas: gasForFCTCall[payer] + gasForPaymentApprovals[payer],
    };
  });
}

export function getEffectiveGasPrice({
  maxGasPrice,
  gasPrice,
}: {
  maxGasPrice: string | bigint;
  gasPrice: string | bigint;
}) {
  return (
    (BigInt(gasPrice) * BigInt(10000 + 1000) + (BigInt(maxGasPrice) - BigInt(gasPrice)) * BigInt(5000)) /
    BigInt(10000)
  ).toString();
}
