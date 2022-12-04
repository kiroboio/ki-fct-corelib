import { BigNumber as BigNumberEthers, ethers, utils } from "ethers";
import BigNumber from "bignumber.js";

import FCTActuatorABI from "../abi/FCT_Actuator.abi.json";
import BatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import { GasPrice, IFCT, ITxValidator } from "./types";
import { TypedDataLimits } from "batchMultiSigCall/interfaces";

export const transactionValidator = async (txVal: ITxValidator, pureGas = false) => {
  const { callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl, activateForFree } = txVal;

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(actuatorPrivateKey, provider);
  const actuatorContract = new ethers.Contract(actuatorContractAddress, FCTActuatorABI, signer);

  const gasPrice: GasPrice = txVal.eip1559
    ? (
        await getGasPriceEstimations({
          rpcUrl,
          historicalBlocks: 20,
        })
      )[txVal.gasPriority || "average"]
    : { gasPrice: (await provider.getGasPrice()).toNumber() };

  try {
    let gas: BigNumberEthers;
    if (activateForFree) {
      gas = await actuatorContract.estimateGas.activateForFree(callData, signer.address, {
        ...gasPrice,
      });
    } else {
      gas = await actuatorContract.estimateGas.activate(callData, signer.address, {
        ...gasPrice,
      });
    }

    // Add 15% to gasUsed value
    const gasUsed = pureGas ? gas.toNumber() : Math.round(gas.toNumber() + gas.toNumber() * 0.15);

    return {
      isValid: true,
      txData: { gas: gasUsed, ...gasPrice, type: txVal.eip1559 ? 2 : 1 },
      error: null,
    };
  } catch (err: any) {
    return {
      isValid: false,
      txData: { gas: 0, ...gasPrice, type: txVal.eip1559 ? 2 : 1 },
      error: err.reason,
    };
  }
};

export const getGasPriceEstimations = async ({
  rpcUrl,
  historicalBlocks,
}: {
  rpcUrl: string;
  historicalBlocks: number;
}) => {
  function avg(arr: number[]) {
    const sum = arr.reduce((a, v) => a + v);
    return Math.round(sum / arr.length);
  }

  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_feeHistory",
      params: [historicalBlocks, "latest", [25, 50, 75]],
      id: 1,
    }),
  });
  const { result } = await res.json();

  let blockNum = parseInt(result.oldestBlock, 16);
  let index = 0;
  const blocks = [];

  while (blockNum < parseInt(result.oldestBlock, 16) + historicalBlocks) {
    blocks.push({
      number: blockNum,
      baseFeePerGas: Number(result.baseFeePerGas[index]),
      gasUsedRatio: Number(result.gasUsedRatio[index]),
      priorityFeePerGas: result.reward[index].map((x: string) => Number(x)),
    });
    blockNum += 1;
    index += 1;
  }

  const slow = avg(blocks.map((b) => b.priorityFeePerGas[0]));
  const average = avg(blocks.map((b) => b.priorityFeePerGas[1]));
  const fast = avg(blocks.map((b) => b.priorityFeePerGas[2]));

  const baseFeePerGas = Number(result.baseFeePerGas[historicalBlocks]);

  return {
    slow: {
      maxFeePerGas: slow + baseFeePerGas,
      maxPriorityFeePerGas: slow,
    },
    average: {
      maxFeePerGas: average + baseFeePerGas,
      maxPriorityFeePerGas: average,
    },
    fast: {
      maxFeePerGas: fast + baseFeePerGas,
      maxPriorityFeePerGas: fast,
    },
  };
};

export const getFCTGasEstimation = async ({
  fct,
  callData,
  batchMultiSigCallAddress,
  rpcUrl,
}: {
  fct: IFCT;
  callData: string;
  batchMultiSigCallAddress: string;
  rpcUrl: string;
}) => {
  const FCTOverhead = 135500;
  const callOverhead = 16370;
  const numOfCalls = fct.mcall.length;
  const actuator = new ethers.utils.Interface(FCTActuatorABI);
  const batchMultiSigCallContract = new ethers.Contract(
    batchMultiSigCallAddress,
    BatchMultiSigCallABI,
    new ethers.providers.JsonRpcProvider(rpcUrl)
  );

  const calcMemory = (input: number) => {
    return input * 3 + (input * input) / 512;
  };

  const callDataString = callData.slice(2);
  const callDataArray = callDataString.split("");
  const totalCallDataCost = callDataArray.reduce((accumulator, item) => {
    if (item === "0") return accumulator + 4;
    else return accumulator + 16;
  }, 21000);

  const nonZero = callDataArray.reduce((accumulator, item) => {
    if (item !== "0") return accumulator + 1;
    else return accumulator + 0;
  }, 0);

  const dataLength =
    actuator.encodeFunctionData("activate", [callData, "0x0000000000000000000000000000000000000000"]).length / 2;

  let totalGas = new BigNumber(0);
  for (const call of fct.mcall) {
    if (call.types.length > 0) {
      const gasForCall = await batchMultiSigCallContract.estimateGas.abiToEIP712(
        call.data,
        call.types,
        call.typedHashes,
        { data: 0, types: 0 }
      );

      totalGas = totalGas.plus(gasForCall.toString());
    }
  }

  const gasEstimation = new BigNumber(FCTOverhead)
    .plus(new BigNumber(callOverhead).times(numOfCalls))
    .plus(totalCallDataCost)
    .plus(calcMemory(dataLength))
    .plus(calcMemory(nonZero))
    .plus(new BigNumber(dataLength).times(600).div(32))
    .plus(totalGas)
    .times(1.1); // Add 10% as a buffer

  return gasEstimation.toString();

  //   const gasEstimation = BigNumberEthers.from(FCTOverhead)
  //     .add(callOverhead * numOfCalls)
  //     .add(totalCallDataCost)
  //     .add(calcMemory(dataLength))
  //     .sub(calcMemory(nonZero))
  //     .add(BigNumberEthers.from(dataLength * 600).div(32))
  //     .add(totalGas)
  //     .mul(1.1);

  //   return (
  //     FCTOverhead +
  //     callOverhead * numOfCalls +
  //     totalCallDataCost +
  //     calcMemory(dataLength) -
  //     calcMemory(nonZero) +
  //     (dataLength * 600) / 32 +
  //     totalGas.toNumber()
  //   );
};

export const getKIROPayment = async ({
  fct,
  kiroPrice,
  ethPrice,
  gasPrice,
  gasLimit,
}: {
  fct: IFCT;
  kiroPrice: string;
  ethPrice: string;
  gasPrice: number;
  gasLimit: number;
}) => {
  const vault = fct.typedData.message["transaction_1"].call.from;

  // const gas = await getFCTGasEstimation({ fct, batchMultiSigCallAddress, rpcUrl, callData });
  const gas = gasLimit;
  const gasPriceFormatted = utils.formatUnits(gasPrice, "gwei");

  const baseGasCost = new BigNumber(gas).times(gasPriceFormatted).shiftedBy(-9);

  const limits = fct.typedData.message.limits as TypedDataLimits;
  const maxGasPrice = utils.formatUnits(limits.gas_price_limit, "gwei");

  const priceDif = new BigNumber(maxGasPrice).minus(gasPriceFormatted);
  const feeGasCost = new BigNumber(gas).times(priceDif);

  const totalCost = baseGasCost.plus(feeGasCost);

  // Get USD Value of totalCost
  const totalCostUSD = totalCost.times(ethPrice);

  // Get KIRO Value of totalCostUSD
  const totalCostKIRO = totalCostUSD.div(kiroPrice);

  return {
    vault,
    amount: totalCostKIRO.toString(),
  };
};

// const getRequiredKIRO = async ({
//   fct,
//   batchMultiSigCallAddress,
//   rpcUrl,
// }: {
//   fct: IFCT;
//   batchMultiSigCallAddress: string;
//   rpcUrl: string;
// }) => {
//   const batchMultiSigCallContract = new ethers.Contract(
//     batchMultiSigCallAddress,
//     BatchMultiSigCallABI,
//     new ethers.providers.JsonRpcProvider(rpcUrl)
//   );

//   const calcMemory = (input: number) => {
//     return input * 3 + (input * input) / 512;
//   };

//   const FCTOverhead = 135500;
//   const callOverhead = 16370;
//   const payers = {};

//   const commonGasPerCall = FCTOverhead / fct.mcall.length + callOverhead;
//   for (const call of fct.mcall) {
//     const dataLength = call.data.length / 2;

//     const callDataString = call.data.slice(2);
//     const callDataArray = callDataString.split("");
//     const totalCallDataCost = callDataArray.reduce((accumulator, item) => {
//       if (item === "0") return accumulator + 4;
//       else return accumulator + 16;
//     }, 0);

//     const nonZero = callDataArray.reduce((accumulator, item) => {
//       if (item !== "0") return accumulator + 1;
//       else return accumulator + 0;
//     }, 0);

//     const gasForCall = await batchMultiSigCallContract.estimateGas.abiToEIP712(
//       call.data,
//       call.types,
//       call.typedHashes,
//       { data: 0, types: 0 }
//     );

//     const gas = new BigNumber(totalCallDataCost)
//       .plus(calcMemory(dataLength))
//       .minus(calcMemory(nonZero))
//       .plus((dataLength * 600) / 32)
//       .plus(gasForCall.toString())
//       .plus(commonGasPerCall);

//     if (payers[call.from]) {
//       payers[call.from] = new BigNumber(payers[call.from]).plus(gas).toString();
//     } else {
//       payers[call.from] = gas.toString();
//     }
//   }

//   return payers;
// };
