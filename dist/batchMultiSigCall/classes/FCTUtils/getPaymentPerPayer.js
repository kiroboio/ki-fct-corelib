"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEffectiveGasPrice = exports.getPayersForRoute = void 0;
const CallID_1 = require("../CallID");
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
    mcallOverheadFirstCall: 34000n,
    mcallOverheadOtherCalls: 6250n,
    paymentApproval: 9000n,
    paymentsOutBase: 24500n,
    paymentsOutPerPayment: 1300n,
    totalCallsChecker: 16000n,
    estimateExtraCommmonGasCost: 4000n,
};
const getEncodingMcallCost = (callCount) => {
    return (BigInt(callCount) * fees.gasForEncodingCall +
        (BigInt(callCount) * BigInt(callCount - 1) * fees.additionalGasForEncodingCall) / 2n);
};
const getSignatureRecoveryCost = (signatureCount) => {
    return BigInt(signatureCount) * fees.signatureRecovery;
};
const getPaymentsOutCost = (callCount) => {
    return fees.paymentsOutBase + BigInt(callCount) * fees.paymentsOutPerPayment;
};
const getExtraCommonGas = (payersCount, msgDataLength) => {
    return 23100n + 4600n * BigInt(payersCount) + (77600n * BigInt(msgDataLength)) / 10000n;
};
const getPayers = (calls, pathIndexes) => {
    return pathIndexes.reduce((acc, pathIndex) => {
        const call = calls[Number(pathIndex)];
        const { payerIndex } = CallID_1.CallID.parse(call.callId);
        const payer = payerIndex === 0 ? undefined : calls[payerIndex - 1].from;
        // If payer !== undefined AND payer !== lastPayer, add it to the array
        if (payer && payer !== acc[acc.length - 1]) {
            acc.push(payer);
        }
        return acc;
    }, []);
};
const getAllSenders = (calls) => {
    return calls.reduce((acc, call) => {
        // If call.from is already in the array, don't add it
        if (!acc.includes(call.from)) {
            acc.push(call.from);
        }
        return acc;
    }, []);
};
function getPayersForRoute({ calls, pathIndexes, calldata, }) {
    const payers = getPayers(calls, pathIndexes);
    const allSenders = getAllSenders(calls);
    const batchMultiSigCallOverhead = fees.FCTControllerOverhead +
        fees.gasBeforeEncodedLoop +
        getEncodingMcallCost(calls.length) +
        fees.FCTControllerRegisterCall +
        getSignatureRecoveryCost(allSenders.length + 1) + // +1 because verification signature
        fees.miscGasBeforeMcallLoop;
    const overhead = fees.beforeCallingBatchMultiSigCall +
        batchMultiSigCallOverhead +
        getPaymentsOutCost(calls.length) +
        fees.totalCallsChecker +
        fees.estimateExtraCommmonGasCost;
    const commonGas = getExtraCommonGas(payers.length, calldata.length) + overhead;
    const commonGasPerCall = commonGas / BigInt(payers.length);
    const gasForFCTCall = pathIndexes.reduce((acc, path, index) => {
        const call = calls[Number(path)];
        const { payerIndex, options } = CallID_1.CallID.parse(call.callId);
        const payer = calls[payerIndex - 1].from;
        const overhead = index === 0 ? fees.mcallOverheadFirstCall : fees.mcallOverheadOtherCalls;
        const gas = BigInt(options.gasLimit) || 50000n;
        const amount = gas + overhead + commonGasPerCall;
        if (acc[payer]) {
            acc[payer] += amount;
        }
        else {
            acc[payer] = amount;
        }
        return acc;
    }, {});
    const gasForPaymentApprovals = payers.reduce((acc, address) => {
        if (acc[address]) {
            acc[address] += fees.paymentApproval;
        }
        else {
            acc[address] = fees.paymentApproval;
        }
        return acc;
    }, {});
    return allSenders.map((payer) => {
        const gas = gasForFCTCall[payer] + gasForPaymentApprovals[payer];
        return {
            payer,
            gas: gas || 0n,
        };
    });
}
exports.getPayersForRoute = getPayersForRoute;
function getEffectiveGasPrice({ maxGasPrice, gasPrice, baseFeeBPS, bonusFeeBPS, }) {
    return ((BigInt(gasPrice) * WHOLE_IN_BPS + baseFeeBPS + (BigInt(maxGasPrice) - BigInt(gasPrice)) * bonusFeeBPS) /
        WHOLE_IN_BPS).toString();
}
exports.getEffectiveGasPrice = getEffectiveGasPrice;
