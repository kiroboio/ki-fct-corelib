"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preparePaymentPerPayerResult = exports.getPayerMap = exports.getGasPrices = exports.getCostInKiro = exports.getEffectiveGasPrice = exports.getPayersForRoute = exports.getFee = void 0;
const ethers_1 = require("ethers");
// fctCall overhead (1st call) - 40k
// fctCall overhead (other calls) - 11k
// TODO: This needs to be heavily optimized.
const WHOLE_IN_BPS = 10000n;
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
};
// Arbitrum fees are 13x higher than Ethereum fees. Multiply all fees by 13.
const arbitrumFees = Object.fromEntries(Object.entries(fees).map(([key, value]) => [key, BigInt(value) * 13n]));
function getFee(key, chainId) {
    if (chainId === "42161" || chainId === "421613") {
        return arbitrumFees[key];
    }
    return fees[key];
}
exports.getFee = getFee;
const getEncodingMcallCost = (callCount, chainId) => {
    return (BigInt(callCount) * getFee("gasForEncodingCall", chainId) +
        (BigInt(callCount) * BigInt(callCount - 1) * getFee("additionalGasForEncodingCall", chainId)) / 2n);
};
const getSignatureRecoveryCost = (signatureCount, chainId) => {
    return BigInt(signatureCount) * getFee("signatureRecovery", chainId);
};
const getPaymentsOutCost = (callCount, chainId) => {
    return getFee("paymentsOutBase", chainId) + BigInt(callCount) * getFee("paymentsOutPerPayment", chainId);
};
const getExtraCommonGas = (payersCount, msgDataLength) => {
    return 23100n + 4600n * BigInt(payersCount) + (77600n * BigInt(msgDataLength)) / 10000n;
};
const getPayers = (calls, pathIndexes) => {
    return pathIndexes.reduce((acc, pathIndex) => {
        const call = calls[Number(pathIndex)];
        const payerIndex = call.options.payerIndex;
        if (payerIndex === 0)
            return acc;
        const payer = calls[payerIndex - 1].get().from;
        if (payer && payer !== acc[acc.length - 1] && typeof payer === "string") {
            acc.push(payer);
        }
        return acc;
    }, []);
};
const getAllSigners = (calls) => {
    return calls.reduce((acc, call) => {
        const from = call.get().from;
        if (typeof from === "string" && !acc.includes(from)) {
            acc.push(from);
        }
        return acc;
    }, []);
};
function getPayersForRoute({ chainId, calls, pathIndexes, calldata, }) {
    const payers = getPayers(calls, pathIndexes);
    const allSigners = getAllSigners(calls);
    const batchMultiSigCallOverhead = getFee("FCTControllerOverhead", chainId) +
        getFee("gasBeforeEncodedLoop", chainId) +
        getEncodingMcallCost(calls.length, chainId) +
        getFee("FCTControllerRegisterCall", chainId) +
        getSignatureRecoveryCost(allSigners.length + 1, chainId) + // +1 because verification signature
        getFee("miscGasBeforeMcallLoop", chainId);
    const overhead = getFee("beforeCallingBatchMultiSigCall", chainId) +
        batchMultiSigCallOverhead +
        getPaymentsOutCost(calls.length, chainId) +
        getFee("totalCallsChecker", chainId) +
        getFee("estimateExtraCommmonGasCost", chainId);
    const commonGas = getExtraCommonGas(payers.length, calldata.length) + overhead;
    const commonGasPerCall = commonGas / BigInt(pathIndexes.length);
    const gasForFCTCall = pathIndexes.reduce((acc, path) => {
        const call = calls[Number(path)];
        const _call = call.get();
        const options = _call.options;
        const payerIndex = options.payerIndex;
        // If payer is the activator, dont add it to the needed fuel
        if (payerIndex === 0)
            return acc;
        const payer = calls[payerIndex - 1].get().from;
        if (typeof payer !== "string")
            return acc;
        const gas = BigInt(options.gasLimit) || getFee("defaultGasLimit", chainId);
        const amount = gas + commonGasPerCall;
        if (acc[payer]) {
            acc[payer] += amount;
        }
        else {
            acc[payer] = amount;
        }
        return acc;
    }, {});
    const gasForPaymentApprovals = payers.reduce((acc, address) => {
        const fee = getFee("paymentApproval", chainId);
        if (acc[address]) {
            acc[address] += fee;
        }
        else {
            acc[address] = fee;
        }
        return acc;
    }, {});
    return payers.map((payer) => {
        const gas = gasForFCTCall[payer] + gasForPaymentApprovals[payer];
        return {
            payer,
            gas: gas || 0n,
        };
    });
}
exports.getPayersForRoute = getPayersForRoute;
function getEffectiveGasPrice({ maxGasPrice, gasPrice, baseFeeBPS, bonusFeeBPS, }) {
    return ((BigInt(gasPrice) * (WHOLE_IN_BPS + baseFeeBPS) + (BigInt(maxGasPrice) - BigInt(gasPrice)) * bonusFeeBPS) /
        WHOLE_IN_BPS).toString();
}
exports.getEffectiveGasPrice = getEffectiveGasPrice;
function getCostInKiro({ ethPriceInKIRO, ethCost, }) {
    return (((ethCost || 0n) * BigInt(ethPriceInKIRO)) / 10n ** 18n).toString();
}
exports.getCostInKiro = getCostInKiro;
function getGasPrices({ maxGasPrice, gasPrice, baseFeeBPS, bonusFeeBPS, }) {
    const txGasPrice = gasPrice ? BigInt(gasPrice) : maxGasPrice;
    const effectiveGasPrice = BigInt(getEffectiveGasPrice({
        gasPrice: txGasPrice,
        maxGasPrice,
        baseFeeBPS,
        bonusFeeBPS,
    }));
    return {
        txGasPrice,
        effectiveGasPrice,
    };
}
exports.getGasPrices = getGasPrices;
function getPayerMap({ chainId, paths, calldata, calls, gasPrice, maxGasPrice, baseFeeBPS, bonusFeeBPS, penalty, }) {
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
        });
        return payers.reduce((acc, payer) => {
            const base = payer.gas * txGasPrice;
            const fee = payer.gas * (effectiveGasPrice - txGasPrice);
            const ethCost = base + fee;
            return {
                ...acc,
                [payer.payer]: {
                    ...payer,
                    pureEthCost: ethCost,
                    ethCost: (ethCost * BigInt(penalty || 10_000)) / 10000n,
                },
            };
        }, {});
    });
}
exports.getPayerMap = getPayerMap;
function preparePaymentPerPayerResult({ payerMap, senders, ethPriceInKIRO, }) {
    return senders.map((payer) => {
        const { largest, smallest } = payerMap.reduce((currentValues, pathData) => {
            if (!pathData[payer]) {
                return currentValues;
            }
            const currentLargestValue = currentValues.largest?.ethCost;
            const currentSmallestValue = currentValues.smallest?.ethCost;
            const value = pathData[payer]?.pureEthCost || 0n;
            if (value > currentLargestValue) {
                currentValues.largest = pathData[payer];
            }
            if (currentSmallestValue == 0n || value < currentSmallestValue) {
                currentValues.smallest = pathData[payer];
            }
            return currentValues;
        }, {
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
        });
        const largestKiroCost = getCostInKiro({ ethPriceInKIRO, ethCost: largest?.pureEthCost });
        const smallestKiroCost = getCostInKiro({ ethPriceInKIRO, ethCost: smallest?.pureEthCost });
        return {
            payer,
            largestPayment: {
                gas: largest.gas.toString(),
                tokenAmountInWei: largestKiroCost,
                nativeAmountInWei: largest.ethCost.toString(),
                tokenAmount: ethers_1.utils.formatEther(largestKiroCost),
                nativeAmount: ethers_1.utils.formatEther(largest.ethCost.toString()),
            },
            smallestPayment: {
                gas: smallest.gas.toString(),
                tokenAmountInWei: smallestKiroCost,
                nativeAmountInWei: smallest.ethCost.toString(),
                tokenAmount: ethers_1.utils.formatEther(smallestKiroCost),
                nativeAmount: ethers_1.utils.formatEther(smallest.ethCost.toString()),
            },
        };
    });
}
exports.preparePaymentPerPayerResult = preparePaymentPerPayerResult;
//# sourceMappingURL=getPaymentPerPayer.js.map