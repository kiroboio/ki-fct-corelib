"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCallGasLimit = exports.getGasCosts = void 0;
// Static call overhead first - 34893
// Static call overhead (NOTFIRST) - 8 393
// Delegate call first - 43 622
// Delegate call overhead (NOTFIRST) - 17 122
// If there was already delegate call, other delegate call overhead - 10 622
// Call overhead with ETH (FIRST) - 41396
// Call overhead (NOTFIRST) - 8393
// Cost of ETH in the call - 6503
const gasCosts = {
    call_firstOverhead: 35000n,
    call_otherOverhead: 8400n,
    delegateCall_firstOverhead: 44000n,
    delegateCall_otherOverhead: 17200n,
    delegateCall_repeatOverhead: 10800n,
    nativeTokenOverhead: 6550n,
};
const getGasCosts = (key) => {
    const gas = gasCosts[key];
    return gas;
};
exports.getGasCosts = getGasCosts;
function calculateGasLimit({ gasLimit, gasType }) {
    const gas = (0, exports.getGasCosts)(gasType);
    return (BigInt(gasLimit) + gas).toString();
}
// For getCallGasLimit function
//
// This is the flow:
// 1. Check if it is the first call
// 2. Check if the call is delegate call:
//   2.1 If it is - delegateCall_firstOverhead
//   2.2 If it is not:
//     2.2.1 Check if there was already delegate call - delegateCall_repeatOverhead
//     2.2.2 If there was not - delegateCall_otherOverhead
// 3. Check if the call is static call:
//  3.1 If it is - staticCall_firstOverhead
//  3.2 If it is not - staticCall_otherOverhead
// 4. This is a regular call
//  4.1 If it is first call - call_firstOverhead
//  4.2 If it is not - call_otherOverhead
//  4.3 If it is a call with ETH - add nativeTokenOverhead
function getCallGasLimit({ payerIndex, value, callType, gasLimit, calls, }) {
    const isFirstCall = payerIndex === 0;
    if (callType === "LIBRARY" || callType === "LIBRARY_VIEW_ONLY") {
        if (isFirstCall) {
            return calculateGasLimit({ gasLimit, gasType: "delegateCall_firstOverhead" });
        }
        else {
            const hadDelegateCall = calls.slice(0, payerIndex).some((call) => {
                const callType = call.options.callType;
                return callType === "LIBRARY" || callType === "LIBRARY_VIEW_ONLY";
            });
            if (hadDelegateCall) {
                return calculateGasLimit({ gasLimit, gasType: "delegateCall_repeatOverhead" });
            }
            else {
                return calculateGasLimit({ gasLimit, gasType: "delegateCall_otherOverhead" });
            }
        }
    }
    // Means that it is either ACTION or STATIC_CALL
    let newGasLimit = calculateGasLimit({
        gasLimit,
        gasType: isFirstCall ? "call_firstOverhead" : "call_otherOverhead",
    });
    if (callType === "ACTION" && value && value !== "0") {
        newGasLimit = calculateGasLimit({ gasLimit: newGasLimit, gasType: "nativeTokenOverhead" });
    }
    return newGasLimit;
}
exports.getCallGasLimit = getCallGasLimit;
//# sourceMappingURL=callGas.js.map