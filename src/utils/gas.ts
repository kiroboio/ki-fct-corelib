import { BigNumber as BigNumberEthers, ethers } from "ethers";
import BigNumber from "bignumber.js";

import FCTActuatorABI from "../abi/FCT_Actuator.abi.json";
import BatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import { EIP1559GasPrice, IFCT, ITxValidator, LegacyGasPrice } from "./types";
import { TypedDataLimits } from "../batchMultiSigCall/types";
import { parseCallID } from "../batchMultiSigCall/helpers";

export const transactionValidator = async (txVal: ITxValidator, pureGas = false) => {
  const { callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl, activateForFree } = txVal;

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(actuatorPrivateKey, provider);
  const actuatorContract = new ethers.Contract(actuatorContractAddress, FCTActuatorABI, signer);

  const gasPrice = txVal.eip1559
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

    // Add 20% to gasUsed value
    const gasUsed = pureGas ? gas.toNumber() : Math.round(gas.toNumber() + gas.toNumber() * 0.2);

    if (txVal.eip1559 && "maxFeePerGas" in gasPrice) {
      return {
        isValid: true,
        txData: { gas: gasUsed, ...(gasPrice as EIP1559GasPrice), type: 2 },
        error: null,
      };
    } else {
      return {
        isValid: true,
        txData: { gas: gasUsed, ...(gasPrice as LegacyGasPrice), type: 1 },
        error: null,
      };
    }
  } catch (err: any) {
    if (err.reason === "processing response error") {
      throw err;
    }
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
    return accumulator + 16;
  }, 21000);

  const nonZero = callDataArray.reduce((accumulator, item) => {
    if (item !== "0") return accumulator + 1;
    return accumulator + 0;
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

  // Overhead calculation
  // FCTOverhead +
  // (totalCallDataCost - mcallTotalCost) +
  // (dataLength - mcallDataTotalLength) -
  // nonZero +
  // (new BigNumber(dataLength).times(600).div(32) - new BigNumber(mcallDataTotalLength).times(600).div(32)) / mcall.length

  const gasEstimation = new BigNumber(FCTOverhead)
    .plus(new BigNumber(callOverhead).times(numOfCalls))
    .plus(totalCallDataCost)
    .plus(calcMemory(dataLength))
    .minus(calcMemory(nonZero))
    .plus(new BigNumber(dataLength).times(600).div(32))
    .plus(totalGas)
    .times(1.1); // Add 10% as a buffer

  return gasEstimation.toString();
};

// 38270821632831754769812 - kiro price
// 1275004198 - max fee
// 462109 - gas

// 34.910655705373187788
export const getKIROPayment = async ({
  fct,
  kiroPriceInETH,
  gasPrice,
  gasLimit,
}: {
  fct: IFCT;
  kiroPriceInETH: string;
  gasPrice: number;
  gasLimit: number;
}) => {
  const vault = fct.typedData.message["transaction_1"].call.from;

  const gas = BigInt(gasLimit);
  const gasPriceFormatted = BigInt(gasPrice);

  const baseGasCost = gas * gasPriceFormatted;

  const limits = fct.typedData.message.limits as TypedDataLimits;
  const maxGasPrice = limits.gas_price_limit;

  // 1000 - baseFee
  // 5000 - bonusFee

  const effectiveGasPrice =
    (gasPriceFormatted * BigInt(10000 + 1000) + (BigInt(maxGasPrice) - gasPriceFormatted) * BigInt(5000)) /
    BigInt(10000);

  const feeGasCost = gas * (effectiveGasPrice - gasPriceFormatted);
  const totalCost = baseGasCost + feeGasCost;

  const normalisedKiroPriceInETH = BigInt(kiroPriceInETH);
  const kiroCost = Number(totalCost * normalisedKiroPriceInETH) / 1e36;

  return {
    vault,
    amount: kiroCost.toString(),
  };
};

export const getFCTCostInKIRO = async ({
  fct,
  callData,
  batchMultiSigCallAddress,
  gasPrice,
  kiroPriceInETH,
  rpcUrl,
}: {
  fct: IFCT;
  callData: string;
  batchMultiSigCallAddress: string;
  gasPrice: number;
  kiroPriceInETH: string;
  rpcUrl: string;
}) => {
  const FCTOverhead = 135500;
  const callOverhead = 16370;
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
    return accumulator + 16;
  }, 21000);

  const nonZero = callDataArray.reduce((accumulator, item) => {
    if (item !== "0") return accumulator + 1;
    return accumulator + 0;
  }, 0);

  const dataLength =
    actuator.encodeFunctionData("activate", [callData, "0x0000000000000000000000000000000000000000"]).length / 2;

  let totalCallGas = BigInt(0);
  for (const call of fct.mcall) {
    if (call.types.length > 0) {
      const initGas = BigInt(callOverhead);
      const gasForCall = await batchMultiSigCallContract.estimateGas.abiToEIP712(
        call.data,
        call.types,
        call.typedHashes,
        { data: 0, types: 0 }
      );

      const callId = parseCallID(call.callId);
      const gasLimit = callId.options.gasLimit;

      totalCallGas = totalCallGas + initGas + BigInt(gasLimit) + BigInt(gasForCall.toString());
    }
  }

  // Overhead calculation
  // FCTOverhead +
  // (totalCallDataCost - mcallTotalCost) +
  // (dataLength - mcallDataTotalLength) -
  // nonZero +
  // (new BigNumber(dataLength).times(600).div(32) - new BigNumber(mcallDataTotalLength).times(600).div(32)) / mcall.length

  const gasEstimation =
    BigInt(FCTOverhead) +
    BigInt(totalCallDataCost) +
    BigInt(calcMemory(dataLength)) -
    BigInt(calcMemory(nonZero)) +
    BigInt((BigInt(dataLength) * BigInt(600)) / BigInt(32)) +
    BigInt(totalCallGas) * BigInt(1.1);

  // const costInETH = new BigNumber(gasEstimation).times(gasPrice).shiftedBy(-9);
  const costInETH = (BigInt(gasEstimation) * BigInt(gasPrice)) / BigInt(1e9);

  // Return const in KIRO
  const normalisedKIROPrice = BigInt(kiroPriceInETH) / BigInt(1e18);
  const costInKIRO = costInETH * normalisedKIROPrice;

  return costInKIRO.toString();
};
