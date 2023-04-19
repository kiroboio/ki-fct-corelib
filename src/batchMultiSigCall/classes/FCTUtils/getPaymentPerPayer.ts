import { CallID } from "../CallID";

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
