import { utils } from "ethers";

import { FCTUtils } from "../..";
import { Call } from "../../Call";
import { PayerPayment } from "../types";
import { BatchMultiSigCall } from "../../../batchMultiSigCall";
import { PluginInstance } from "@kiroboio/fct-plugins";

// fctCall overhead (1st call) - 40k
// fctCall overhead (other calls) - 11k

const pluginCache = new Map<string, PluginInstance | null>();

// TODO: This needs to be heavily optimized.
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
  defaultGasLimit: 30000n,
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

const getPayers = (calls: Call[], pathIndexes: string[]) => {
  return pathIndexes.reduce((acc, pathIndex) => {
    const call = calls[Number(pathIndex)].get();
    const payerIndex = call.options.payerIndex;

    if (payerIndex === 0) return acc;
    if (payerIndex === +pathIndex + 1) {
      const payer = call.from;
      if (payer && payer !== acc[acc.length - 1] && typeof payer === "string") {
        acc.push(payer);
      }
      return acc;
    }
    // Else we dont know the from
    const payer = calls[payerIndex - 1].get().from;
    if (payer && payer !== acc[acc.length - 1] && typeof payer === "string") {
      acc.push(payer);
    }
    return acc;
  }, [] as string[]);
};

const getAllSigners = (calls: Call[]) => {
  return calls.reduce((acc, call) => {
    const from = call.get().from;
    if (typeof from === "string" && !acc.includes(from)) {
      acc.push(from);
    }
    return acc;
  }, [] as string[]);
};

export function getPayersForRoute({
  FCT,
  chainId,
  calls,
  pathIndexes,
  calldata,
  fctID,
}: {
  FCT: BatchMultiSigCall;
  chainId: string;
  calls: Call[];
  pathIndexes: string[];
  calldata: string;
  fctID: string;
}) {
  const payers = getPayers(calls, pathIndexes);
  const allSigners = getAllSigners(calls);
  const batchMultiSigCallOverhead =
    getFee("FCTControllerOverhead", chainId) +
    getFee("gasBeforeEncodedLoop", chainId) +
    getEncodingMcallCost(calls.length, chainId) +
    getFee("FCTControllerRegisterCall", chainId) +
    getSignatureRecoveryCost(allSigners.length + 1, chainId) + // +1 because verification signature
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
    (acc, path, i) => {
      const call = calls[Number(path)];
      const _call = call.get();
      const options = _call.options;
      const payerIndex = options.payerIndex;

      // If payer is the activator, dont add it to the needed fuel
      if (payerIndex === 0) return acc;
      const payer = calls[payerIndex - 1].get().from;
      if (typeof payer !== "string") return acc;

      let gas: bigint;

      if (options.gasLimit === "0") {
        const plugin = getPlugin({ FCT, fctID, index: i });
        gas = plugin && plugin.gasLimit ? BigInt(plugin.gasLimit) : getFee("defaultGasLimit", chainId);
      } else {
        gas = BigInt(options.gasLimit);
      }

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

  return payers.map((payer) => {
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

export function getCostInKiro({
  ethPriceInKIRO,
  ethCost,
}: {
  ethPriceInKIRO: string | bigint;
  ethCost: bigint | undefined;
}) {
  return (((ethCost || 0n) * BigInt(ethPriceInKIRO)) / 10n ** 18n).toString();
}

export function getGasPrices({
  maxGasPrice,
  gasPrice,
  baseFeeBPS,
  bonusFeeBPS,
}: {
  maxGasPrice: bigint;
  gasPrice: bigint;
  baseFeeBPS: bigint;
  bonusFeeBPS: bigint;
}) {
  const txGasPrice = gasPrice ? BigInt(gasPrice) : maxGasPrice;
  const effectiveGasPrice = BigInt(
    getEffectiveGasPrice({
      gasPrice: txGasPrice,
      maxGasPrice,
      baseFeeBPS,
      bonusFeeBPS,
    }),
  );
  return {
    txGasPrice,
    effectiveGasPrice,
  };
}

export function getPayerMap({
  FCT,
  fctID,
  paths,
  calldata,
  calls,
  gasPrice,
  maxGasPrice,
  baseFeeBPS,
  bonusFeeBPS,
  payableGasLimit,
  penalty,
}: {
  FCT: BatchMultiSigCall;
  fctID: string;
  paths: ReturnType<FCTUtils["getAllPaths"]>;
  calldata: string;
  calls: Call[];
  gasPrice: bigint;
  maxGasPrice: bigint;
  baseFeeBPS: bigint;
  bonusFeeBPS: bigint;
  payableGasLimit: bigint | undefined;
  penalty?: number | string;
}) {
  const chainId = FCT.chainId;
  const { txGasPrice, effectiveGasPrice } = getGasPrices({
    maxGasPrice,
    gasPrice,
    baseFeeBPS,
    bonusFeeBPS,
  });
  return paths.map((path) => {
    const payers = getPayersForRoute({
      chainId,
      calldata,
      calls,
      pathIndexes: path,
      FCT,
      fctID,
    });

    return payers.reduce(
      (acc, payer) => {
        let gas: bigint;
        if (payableGasLimit) {
          gas = payer.gas > payableGasLimit ? payableGasLimit : payer.gas;
        } else {
          gas = payer.gas;
        }
        const base = gas * txGasPrice;
        const fee = gas * (effectiveGasPrice - txGasPrice);
        const ethCost = base + fee;

        return {
          ...acc,
          [payer.payer]: {
            ...payer,
            gas: gas,
            pureEthCost: ethCost,
            ethCost: (ethCost * BigInt(penalty || 10_000)) / 10_000n,
          },
        };
      },
      {} as Record<string, PayerPayment>,
    );
  });
}

export function preparePaymentPerPayerResult({
  payerMap,
  senders,
  ethPriceInKIRO,
}: {
  payerMap: Record<string, PayerPayment>[];
  senders: string[];
  ethPriceInKIRO: string | bigint;
}) {
  return senders.map((payer) => {
    const { largest, smallest } = payerMap.reduce(
      (currentValues, pathData) => {
        if (!pathData[payer as keyof typeof pathData]) {
          return currentValues;
        }

        const currentLargestValue = currentValues.largest?.ethCost;
        const currentSmallestValue = currentValues.smallest?.ethCost;

        const value = pathData[payer as keyof typeof pathData]?.pureEthCost || 0n;
        if (value > currentLargestValue) {
          currentValues.largest = pathData[payer as keyof typeof pathData];
        }
        if (currentSmallestValue == 0n || value < currentSmallestValue) {
          currentValues.smallest = pathData[payer as keyof typeof pathData];
        }
        return currentValues;
      },
      {
        largest: {
          payer,
          gas: 0n,
          ethCost: 0n,
          pureEthCost: 0n,
        },
        smallest: {
          payer,
          gas: 0n,
          ethCost: 0n,
          pureEthCost: 0n,
        },
      } as { largest: PayerPayment; smallest: PayerPayment },
    );

    const largestKiroCost = getCostInKiro({ ethPriceInKIRO, ethCost: largest?.pureEthCost });
    const smallestKiroCost = getCostInKiro({ ethPriceInKIRO, ethCost: smallest?.pureEthCost });

    return {
      payer,
      largestPayment: {
        gas: largest.gas.toString(),
        tokenAmountInWei: largestKiroCost,
        nativeAmountInWei: largest.ethCost.toString(),
        tokenAmount: utils.formatEther(largestKiroCost),
        nativeAmount: utils.formatEther(largest.ethCost.toString()),
      },
      smallestPayment: {
        gas: smallest.gas.toString(),
        tokenAmountInWei: smallestKiroCost,
        nativeAmountInWei: smallest.ethCost.toString(),
        tokenAmount: utils.formatEther(smallestKiroCost),
        nativeAmount: utils.formatEther(smallest.ethCost.toString()),
      },
    };
  });
}

function getPlugin({ FCT, fctID, index }: { FCT: BatchMultiSigCall; fctID: string; index: number }) {
  const plugin = pluginCache.get(fctID + index);
  if (plugin || plugin === null) return plugin;

  try {
    const plugin = FCT.getPlugin(index);
    pluginCache.set(fctID + index, plugin);
    return plugin;
  } catch (e) {
    pluginCache.set(fctID + index, null);
    return null;
  }
}
