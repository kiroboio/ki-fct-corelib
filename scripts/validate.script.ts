import FCTData from "../FCT.json";
import { BatchMultiSigCall } from "../src";
// import scriptData from "./scriptData";
const chainId = 5;

// FCTE_Activated - 0x3d67d7b0242c56cec690a3513b11ac7c54835ff09550d772f7f354269829c669
// FCTE_CallPayment - 0x57a285d11c52114e1c932af91ce610073cb95f99c6126bf75c6a59b3846e0d6a

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

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

  const getEncodeingMcallCost = (callAmount: number) => {
    return (
      BigInt(callAmount) * fees.gasForEncodingCall +
      (BigInt(callAmount) * BigInt(callAmount - 1) * fees.additionalGasForEncodingCall) / 2n
    );
  };

  const getSignatureRecoveryCost = (signatureCount: number) => {
    return BigInt(signatureCount) * fees.signatureRecovery;
  };

  const getPaymentsOutCost = (callCount: number) => {
    return fees.paymentsOutBase + BigInt(callCount) * fees.paymentsOutPerPayment;
  };

  // const batchMultiSigCallOverhead = 43000n + 3000n + 8500n + 43000n + 10000n + 1700n;
  // const overhead = 5000n + batchMultiSigCallOverhead + 25800n + 16000n + 4000n;

  const extraCommonGas = 23100n + 4600n * BigInt(1) + (77600n * BigInt(1572)) / 10_000n;

  const batchMultiSigCallOverhead =
    fees.FCTControllerOverhead +
    fees.gasBeforeEncodedLoop +
    getEncodeingMcallCost(1) +
    fees.FCTControllerRegisterCall +
    getSignatureRecoveryCost(2) +
    fees.miscGasBeforeMcallLoop;

  const overhead =
    fees.beforeCallingBatchMultiSigCall +
    batchMultiSigCallOverhead +
    getPaymentsOutCost(1) +
    fees.totalCallsChecker +
    fees.estimateExtraCommmonGasCost;

  const commonGas = extraCommonGas + overhead;

  console.log({
    overhead,
    batchMultiSigCallOverhead,
    extraCommonGas,
    commonGas,
  });

  console.log("expected common gas", 192379);

  console.log(commonGas);
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
