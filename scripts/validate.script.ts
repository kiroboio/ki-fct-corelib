import FCTData from "../FCT.json";
import { BatchMultiSigCall } from "../src";
import { getEffectiveGasPrice, getPayersForRoute } from "../src/batchMultiSigCall/classes/FCTUtils/getPaymentPerPayer";
// import scriptData from "./scriptData";
const chainId = 5;

// FCTE_Activated - 0x3d67d7b0242c56cec690a3513b11ac7c54835ff09550d772f7f354269829c669
// FCTE_CallPayment - 0x57a285d11c52114e1c932af91ce610073cb95f99c6126bf75c6a59b3846e0d6a

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  // const fees = {
  //   beforeCallingBatchMultiSigCall: 5000n,
  //   FCTControllerOverhead: 43000n,
  //   gasBeforeEncodedLoop: 3000n,
  //   gasForEncodingCall: 8000n,
  //   additionalGasForEncodingCall: 100n,
  //   FCTControllerRegisterCall: 43000n,
  //   signatureRecovery: 6000n,
  //   miscGasBeforeMcallLoop: 1700n,
  //   mcallOverheadFirstCall: 34000n,
  //   mcallOverheadOtherCalls: 6250n,
  //   paymentApproval: 9000n,
  //   paymentsOutBase: 24500n,
  //   paymentsOutPerPayment: 1300n,
  //   totalCallsChecker: 16000n,
  //   estimateExtraCommmonGasCost: 4000n,
  // };

  // const getEncodeingMcallCost = (callAmount: number) => {
  //   return (
  //     BigInt(callAmount) * fees.gasForEncodingCall +
  //     (BigInt(callAmount) * BigInt(callAmount - 1) * fees.additionalGasForEncodingCall) / 2n
  //   );
  // };

  // const getSignatureRecoveryCost = (signatureCount: number) => {
  //   return BigInt(signatureCount) * fees.signatureRecovery;
  // };

  // const getPaymentsOutCost = (callCount: number) => {
  //   return fees.paymentsOutBase + BigInt(callCount) * fees.paymentsOutPerPayment;
  // };

  // // const batchMultiSigCallOverhead = 43000n + 3000n + 8500n + 43000n + 10000n + 1700n;
  // // const overhead = 5000n + batchMultiSigCallOverhead + 25800n + 16000n + 4000n;

  // const extraCommonGas = 23100n + 4600n * BigInt(1) + (77600n * BigInt(1572)) / 10_000n;

  // const batchMultiSigCallOverhead =
  //   fees.FCTControllerOverhead +
  //   fees.gasBeforeEncodedLoop +
  //   getEncodeingMcallCost(1) +
  //   fees.FCTControllerRegisterCall +
  //   getSignatureRecoveryCost(2) +
  //   fees.miscGasBeforeMcallLoop;

  // const overhead =
  //   fees.beforeCallingBatchMultiSigCall +
  //   batchMultiSigCallOverhead +
  //   getPaymentsOutCost(1) +
  //   fees.totalCallsChecker +
  //   fees.estimateExtraCommmonGasCost;

  // const commonGas = extraCommonGas + overhead;

  // console.log({
  //   overhead,
  //   batchMultiSigCallOverhead,
  //   extraCommonGas,
  //   commonGas,
  // });

  // console.log("expected common gas", 192379);

  // const payers = ["0x00"];

  // const gasForFCTCall = [35000n].reduce((acc, gas, index) => {
  //   const payer = "0x00";
  //   const overhead = index === 0 ? fees.mcallOverheadFirstCall : fees.mcallOverheadOtherCalls;
  //   const amount = gas + overhead;
  //   if (acc[payer]) {
  //     acc[payer] += amount;
  //   } else {
  //     acc[payer] = amount;
  //   }
  //   return acc;
  // }, {} as Record<string, bigint>);

  // const gasForPaymentApprovals = ["0x00"].reduce((acc, address) => {
  //   if (acc[address]) {
  //     acc[address] += fees.paymentApproval;
  //   } else {
  //     acc[address] = fees.paymentApproval;
  //   }
  //   return acc;
  // }, {} as Record<string, bigint>);

  // const feesForEveryPayer = payers.map((payer) => {
  //   return {
  //     payer,
  //     gas: gasForFCTCall[payer] + gasForPaymentApprovals[payer],
  //   };
  // });

  // console.log("feesForEveryPayer", feesForEveryPayer);

  // // const totalUserGas = 35000n + fees.mcallOverheadFirstCall;

  // // console.log("total gas spent", totalUserGas + commonGas);

  const maxGasPrice = 25000000000n;
  const gasPrice = 25000000000n;
  const effectiveGasPrice = getEffectiveGasPrice({
    gasPrice,
    maxGasPrice,
    baseFeeBPS: 1000n,
    bonusFeeBPS: 5000n,
  });

  // const kiroPerETH = 29174339261661309654809n;
  const kiroPerETH = 1745853614598193n;

  const payers = getPayersForRoute({
    pathIndexes: ["0"],
    calldata: "0".repeat(1572),
    calls: [
      {
        data: "0x0000000000000000000000003d0aa8fc3cbfb7ca765c23cad3c4a917959d6a65000000000000000000000000000000000000000000000000000000000000000c",
        to: "0x8fFE1690dc10FD43Bb8AEc3631f065A7F8197E8f",
        from: "0xba55c7fa8aF85CC1AEE7F3d7924336024F85D5fE",
        value: "0",
        types: [],
        callId: "0x0000000000000000000000000000000000000000000000000100010001000000",
        typeHash: "",
        functionSignature: "0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b",
        typedHashes: [],
        ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      },
    ],
  });

  // Calculate how much it will cost in ETH and KIRO

  const payerPayments = payers.map((payer) => {
    const base = payer.gas * gasPrice;
    const fee = payer.gas * (BigInt(effectiveGasPrice) - gasPrice);
    const ethCost = base + fee;

    const kiroCost = (ethCost * kiroPerETH) / 10n ** 18n;
    return {
      ...payer,
      ethCost,
      kiroCost,
    };
  });

  console.log("payerPayments", payerPayments);
  // 13067050880893n
  // 14880233340139n

  // total eth fees
  // 8523185000000000n
  // 7484620000000000n

  // base kiro
  // 2910383849701593101n - from calculation
  // 11879137164449n - from solidity

  // base
  // 7748350000000000n - from calculation
  // 6804200000000000n - from solidity

  // fee
  // 774835000000000n - from calculation
  // 680420000000000n - from solidity

  // kiro cost
  // 3201422234671752411n - from calculation
  // 13067050880893n
}

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
