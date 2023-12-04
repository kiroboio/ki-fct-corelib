import { MSCall } from "../../types";
import { CallID } from "../CallID";

// fctCall overhead (1st call) - 40k
// fctCall overhead (other calls) - 11k

const WHOLE_IN_BPS = 10000n as const;

const fees = {
  beforeCallingBatchMultiSigCall: 5000n,
  FCTControllerOverhead: 43000n,
  gasBeforeEncodedLoop: 3000n,
  gasForEncodingCall: 8000n,
  additionalGasForEncodingCall: 100n,
  FCTControllerRegisterCall: 43000n,
  signatureRecovery: 6000n,
  miscGasBeforeMcallLoop: 1700n,
  paymentApproval: 9000n,
  paymentsOutBase: 24500n,
  paymentsOutPerPayment: 1300n,
  totalCallsChecker: 16000n,
  estimateExtraCommmonGasCost: 4000n,
  mcallOverheadFirstCall: 40000n,
  mcallOverheadOtherCalls: 11000n,
} as const;

// Arbitrum fees are 13x higher than Ethereum fees. Multiply all fees by 13.
const arbitrumFees = Object.fromEntries(
  Object.entries(fees).map(([key, value]) => [key, BigInt(value) * 13n]),
) as Record<keyof typeof fees, bigint>;

export function getFee(key: keyof typeof fees, chainId: string) {
  if (chainId === "42161" || chainId === "421613") {
    return arbitrumFees[key];
  }
  return fees[key];
}

const getEncodingMcallCost = (callCount: number, chainId: string) => {
  return (
    BigInt(callCount) * getFee("gasForEncodingCall", chainId) +
    (BigInt(callCount) * BigInt(callCount - 1) * getFee("additionalGasForEncodingCall", chainId)) / 2n
  );
};

const getSignatureRecoveryCost = (signatureCount: number, chainId: string) => {
  return BigInt(signatureCount) * getFee("signatureRecovery", chainId);
};

const getPaymentsOutCost = (callCount: number, chainId: string) => {
  return getFee("paymentsOutBase", chainId) + BigInt(callCount) * getFee("paymentsOutPerPayment", chainId);
};

const getExtraCommonGas = (payersCount: number, msgDataLength: number) => {
  return 23100n + 4600n * BigInt(payersCount) + (77600n * BigInt(msgDataLength)) / 10_000n;
};

const getPayers = (calls: MSCall[], pathIndexes: string[]) => {
  return pathIndexes.reduce((acc, pathIndex) => {
    const call = calls[Number(pathIndex)];
    const { payerIndex } = CallID.parse(call.callId);
    const payer = payerIndex === 0 ? undefined : calls[payerIndex - 1].from;
    // If payer !== undefined AND payer !== lastPayer, add it to the array
    if (payer && payer !== acc[acc.length - 1]) {
      acc.push(payer);
    }
    return acc;
  }, [] as string[]);
};

const getAllSenders = (calls: MSCall[]) => {
  return calls.reduce((acc, call) => {
    // If call.from is already in the array, don't add it
    if (!acc.includes(call.from)) {
      acc.push(call.from);
    }
    return acc;
  }, [] as string[]);
};

export function getPayersForRoute({
  chainId,
  calls,
  pathIndexes,
  calldata,
}: {
  chainId: string;
  calls: MSCall[];
  pathIndexes: string[];
  calldata: string;
}) {
  const payers = getPayers(calls, pathIndexes);
  const allSenders = getAllSenders(calls);
  const batchMultiSigCallOverhead =
    getFee("FCTControllerOverhead", chainId) +
    getFee("gasBeforeEncodedLoop", chainId) +
    getEncodingMcallCost(calls.length, chainId) +
    getFee("FCTControllerRegisterCall", chainId) +
    getSignatureRecoveryCost(allSenders.length + 1, chainId) + // +1 because verification signature
    getFee("miscGasBeforeMcallLoop", chainId);

  const overhead =
    getFee("beforeCallingBatchMultiSigCall", chainId) +
    batchMultiSigCallOverhead +
    getPaymentsOutCost(calls.length, chainId) +
    getFee("totalCallsChecker", chainId) +
    getFee("estimateExtraCommmonGasCost", chainId);

  const commonGas = getExtraCommonGas(payers.length, calldata.length) + overhead;
  const commonGasPerCall = commonGas / BigInt(pathIndexes.length);

  const gasForFCTCall = pathIndexes.reduce(
    (acc, path, index) => {
      const call = calls[Number(path)];
      const { payerIndex, options } = CallID.parse(call.callId);
      const payer = calls[payerIndex - 1].from;
      // const overhead =
      //   index === 0 ? getFee("mcallOverheadFirstCall", chainId) : getFee("mcallOverheadOtherCalls", chainId);
      const gas =
        BigInt(options.gasLimit) ||
        30_000n +
          (index === 0 ? getFee("mcallOverheadFirstCall", chainId) : getFee("mcallOverheadOtherCalls", chainId)); // Overhead is in the gasLimit
      const amount = gas + commonGasPerCall;
      if (acc[payer]) {
        acc[payer] += amount;
      } else {
        acc[payer] = amount;
      }
      return acc;
    },
    {} as Record<string, bigint>,
  );

  const gasForPaymentApprovals = payers.reduce(
    (acc, address) => {
      const fee = getFee("paymentApproval", chainId);
      if (acc[address]) {
        acc[address] += fee;
      } else {
        acc[address] = fee;
      }
      return acc;
    },
    {} as Record<string, bigint>,
  );

  return allSenders.map((payer) => {
    const gas = gasForFCTCall[payer] + gasForPaymentApprovals[payer];
    return {
      payer,
      gas: gas || 0n,
    };
  });
}

export function getEffectiveGasPrice({
  maxGasPrice,
  gasPrice,
  baseFeeBPS,
  bonusFeeBPS,
}: {
  maxGasPrice: string | bigint;
  gasPrice: string | bigint;
  baseFeeBPS: bigint;
  bonusFeeBPS: bigint;
}) {
  return (
    (BigInt(gasPrice) * (WHOLE_IN_BPS + baseFeeBPS) + (BigInt(maxGasPrice) - BigInt(gasPrice)) * bonusFeeBPS) /
    WHOLE_IN_BPS
  ).toString();
}
