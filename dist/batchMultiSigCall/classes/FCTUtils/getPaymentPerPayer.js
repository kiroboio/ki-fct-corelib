"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalApprovalCalls = void 0;
const CallID_1 = require("../CallID");
function getTotalApprovalCalls(pathIndexes, calls) {
    // Payer index 0 = actuator pays for the call
    let totalCalls;
    const payerList = pathIndexes.map((index) => {
        const call = calls[Number(index)];
        const { payerIndex } = CallID_1.CallID.parse(call.callId);
        return calls[payerIndex - 1].from;
    });
    console.log("payerList", payerList);
}
exports.getTotalApprovalCalls = getTotalApprovalCalls;
