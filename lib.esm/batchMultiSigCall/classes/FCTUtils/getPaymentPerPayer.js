import { ethers } from "ethers";
import { CallID } from "../CallID";
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
export function getFee(key, chainId) {
    if (chainId === "42161" || chainId === "421613") {
        return arbitrumFees[key];
    }
    return fees[key];
}
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
        const { payerIndex } = CallID.parse(call.callId);
        const payer = payerIndex === 0 ? ethers.constants.AddressZero : calls[payerIndex - 1].from;
        // If payer !== undefined AND payer !== lastPayer, add it to the array
        if (payer && payer !== acc[acc.length - 1]) {
            acc.push(payer);
        }
        return acc;
    }, []);
};
const getAllSigners = (calls) => {
    return calls.reduce((acc, call) => {
        // If call.from is already in the array, don't add it
        if (!acc.includes(call.from)) {
            acc.push(call.from);
        }
        return acc;
    }, []);
};
export function getPayersForRoute({ chainId, calls, pathIndexes, calldata, }) {
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
        const { payerIndex, options } = CallID.parse(call.callId);
        const payer = payerIndex === 0 ? ethers.constants.AddressZero : calls[payerIndex - 1].from;
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
export function getEffectiveGasPrice({ maxGasPrice, gasPrice, baseFeeBPS, bonusFeeBPS, }) {
    return ((BigInt(gasPrice) * (WHOLE_IN_BPS + baseFeeBPS) + (BigInt(maxGasPrice) - BigInt(gasPrice)) * bonusFeeBPS) /
        WHOLE_IN_BPS).toString();
}
export function getCostInKiro({ ethPriceInKIRO, ethCost }) {
    return ((ethCost * BigInt(ethPriceInKIRO)) / 10n ** 18n).toString();
}
//# sourceMappingURL=getPaymentPerPayer.js.map