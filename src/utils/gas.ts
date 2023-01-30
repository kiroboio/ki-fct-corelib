import { ChainId, getPlugin } from "@kirobo/ki-eth-fct-provider-ts";
import BigNumber from "bignumber.js";
import { FCTBatchMultiSigCall } from "corelib";
import { BigNumber as BigNumberEthers, ethers } from "ethers";
import { hexlify } from "ethers/lib/utils";

import FCTActuatorABI from "../abi/FCT_Actuator.abi.json";
import BatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import { parseCallID } from "../batchMultiSigCall/helpers";
import { TypedDataLimits } from "../batchMultiSigCall/types";
import { getAllFCTPaths } from "./FCT";
import { EIP1559GasPrice, IFCT, ITxValidator, LegacyGasPrice } from "./types";

interface TransactionValidatorSuccess<T extends ITxValidator> {
  isValid: true;
  txData: T extends { eip1559: true }
    ? { gas: number; type: 2 } & EIP1559GasPrice
    : { gas: number; type: 1 } & LegacyGasPrice;
  prices: { gas: number; gasPrice: number };
  error: null;
}

interface TransactionValidatorError<T extends ITxValidator> {
  isValid: false;
  txData: T extends { eip1559: true }
    ? { gas: number; type: 2 } & EIP1559GasPrice
    : { gas: number; type: 1 } & LegacyGasPrice;
  prices: { gas: number; gasPrice: number };
  error: string;
}

type TransactionValidatorResult<T extends ITxValidator> = TransactionValidatorSuccess<T> | TransactionValidatorError<T>;

type GasPriceType<T extends ITxValidator> = T extends { eip1559: true } ? EIP1559GasPrice : LegacyGasPrice;

export const transactionValidator = async <T extends ITxValidator>(
  txVal: T,
  pureGas = false
): Promise<TransactionValidatorResult<T>> => {
  const { callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl, activateForFree } = txVal;

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(actuatorPrivateKey, provider);
  const actuatorContract = new ethers.Contract(actuatorContractAddress, FCTActuatorABI, signer);

  const gasPrice: GasPriceType<T> = txVal.eip1559
    ? ((
        await getGasPrices({
          rpcUrl,
        })
      )[txVal.gasPriority || "average"] as any)
    : ({ gasPrice: (await provider.getGasPrice()).mul(11).div(10).toNumber() } as any);

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
        txData: { gas: gasUsed, ...gasPrice, type: 2 },
        prices: { gas: gasUsed, gasPrice: gasPrice.maxFeePerGas },
        error: null,
      } as any;
    } else {
      return {
        isValid: true,
        txData: { gas: gasUsed, ...gasPrice, type: 1 },
        prices: { gas: gasUsed, gasPrice: gasPrice.gasPrice },
        error: null,
      } as any;
    }
  } catch (err: any) {
    if (err.reason === "processing response error") {
      throw err;
    }
    return {
      isValid: false,
      txData: { gas: 0, ...gasPrice, type: txVal.eip1559 ? 2 : 1 },
      prices: {
        gas: 0,
        gasPrice: txVal.eip1559 ? (gasPrice as EIP1559GasPrice).maxFeePerGas : (gasPrice as LegacyGasPrice).gasPrice,
      },
      error: err.reason,
    } as any;
  }
};

export const getGasPrices = async ({
  rpcUrl,
  historicalBlocks = 10,
  tries = 40,
}: {
  rpcUrl: string;
  historicalBlocks?: number;
  tries?: number;
}) => {
  function avg(arr: number[]) {
    const sum = arr.reduce((a, v) => a + v);
    return Math.round(sum / arr.length);
  }
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  let keepTrying = true;
  let returnValue: Record<"slow" | "average" | "fast" | "fastest", EIP1559GasPrice>;

  do {
    try {
      const latestBlock = await provider.getBlock("latest");
      if (!latestBlock.baseFeePerGas) {
        throw new Error("No baseFeePerGas");
      }
      const baseFee = latestBlock.baseFeePerGas.toString();
      const blockNumber = latestBlock.number;

      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_feeHistory",
          params: [historicalBlocks, hexlify(blockNumber), [2, 5, 25, 50]],
          id: 1,
        }),
      });
      const { result } = await res.json();

      if (!result) {
        throw new Error("No result");
      }

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
      const fastest = avg(blocks.map((b) => b.priorityFeePerGas[3]));

      const baseFeePerGas = Number(baseFee);

      returnValue = {
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
        fastest: {
          maxFeePerGas: fastest + baseFeePerGas,
          maxPriorityFeePerGas: fastest,
        },
      };

      keepTrying = false;

      return returnValue;
    } catch (err) {
      console.log("Error getting gas prices, retrying", err);

      if (tries > 0) {
        // Wait 3 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        throw new Error("Could not get gas prices, issue might be related to node provider");
      }
    }
  } while (keepTrying && tries-- > 0);
  throw new Error("Could not get gas prices, issue might be related to node provider");
};

export const estimateFCTGasCost = async ({
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

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const batchMultiSigCallContract = new ethers.Contract(batchMultiSigCallAddress, BatchMultiSigCallABI, provider);
  const chainId = (await provider.getNetwork()).chainId;

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

  let totalCallGas = new BigNumber(0);
  for (const call of fct.mcall) {
    if (call.types.length > 0) {
      const gasForCall = await batchMultiSigCallContract.estimateGas.abiToEIP712(
        call.data,
        call.types,
        call.typedHashes,
        { data: 0, types: 0 }
      );

      const pluginData = getPlugin({
        address: call.to,
        chainId: chainId.toString() as ChainId,
        signature: call.functionSignature,
      });

      if (pluginData) {
        const gasLimit = new pluginData.plugin({ chainId: chainId.toString() as ChainId }).gasLimit;

        if (gasLimit) {
          totalCallGas = totalCallGas.plus(gasLimit);
        }
      }

      totalCallGas = totalCallGas.plus(gasForCall.toString());
    }
  }

  const gasEstimation = new BigNumber(FCTOverhead)
    .plus(new BigNumber(callOverhead).times(numOfCalls))
    .plus(totalCallDataCost)
    .plus(calcMemory(dataLength))
    .minus(calcMemory(nonZero))
    .plus(new BigNumber(dataLength).times(600).div(32))
    .plus(totalCallGas);

  return gasEstimation.toString();
};

// 38270821632831754769812 - kiro price
// 1275004198 - max fee
// 462109 - gas

export const getKIROPayment = ({
  fct,
  kiroPriceInETH,
  gasPrice,
  gas,
}: {
  fct: IFCT;
  kiroPriceInETH: string;
  gasPrice: number;
  gas: number;
}) => {
  const vault = fct.typedData.message["transaction_1"].call.from;

  const gasInt = BigInt(gas);
  const gasPriceFormatted = BigInt(gasPrice);

  const limits = fct.typedData.message.limits;
  const maxGasPrice = limits.gas_price_limit;

  // 1000 - baseFee
  // 5000 - bonusFee

  const effectiveGasPrice =
    (gasPriceFormatted * BigInt(10000 + 1000) + (BigInt(maxGasPrice) - gasPriceFormatted) * BigInt(5000)) /
    BigInt(10000);

  const feeGasCost = gasInt * (effectiveGasPrice - gasPriceFormatted);
  const baseGasCost = gasInt * gasPriceFormatted;

  const totalCost = baseGasCost + feeGasCost;

  const normalisedKiroPriceInETH = BigInt(kiroPriceInETH);
  const kiroCost = Number(totalCost * normalisedKiroPriceInETH) / 1e36;
  const amountInETH = Number(totalCost) / 1e18;

  return {
    vault,
    amountInKIRO: kiroCost.toString(),
    amountInETH: amountInETH.toString(),
  };
};

export const getPaymentPerPayer = ({
  fct,
  gasPrice,
  kiroPriceInETH,
  penalty,
}: {
  fct: IFCT;
  gasPrice?: number;
  kiroPriceInETH: string;
  penalty?: number;
}) => {
  penalty = penalty || 1;
  const allPaths = getAllFCTPaths(fct);

  fct.signatures = fct.signatures || [];

  const callData = FCTBatchMultiSigCall.utils.getCalldataForActuator({
    signedFCT: fct,
    activator: "0x0000000000000000000000000000000000000000",
    investor: "0x0000000000000000000000000000000000000000",
    purgedFCT: "0x".padEnd(66, "0"),
    version: "010101",
  });

  const FCTOverhead = 35000 + 8500 * (fct.mcall.length + 1) + (79000 * callData.length) / 10000 + 135500;
  const callOverhead = 16370;
  const defaultCallGas = 50000;

  const limits = fct.typedData.message.limits as TypedDataLimits;
  const maxGasPrice = limits.gas_price_limit;

  const FCTgasPrice = gasPrice ? gasPrice.toString() : maxGasPrice;
  const bigIntGasPrice = BigInt(FCTgasPrice);

  const effectiveGasPrice = (
    (bigIntGasPrice * BigInt(10000 + 1000) + (BigInt(maxGasPrice) - bigIntGasPrice) * BigInt(5000)) / BigInt(10000) -
    bigIntGasPrice
  ).toString();

  const data = allPaths.map((path) => {
    const FCTOverheadPerPayer = (FCTOverhead / path.length).toFixed(0);

    return path.reduce((acc, callIndex) => {
      const call = fct.mcall[Number(callIndex)];
      const callId = parseCallID(call.callId);
      const payerIndex = callId.payerIndex;
      const payer = fct.mcall[payerIndex - 1].from;

      // 21000 - base fee of the call on EVMs
      const gasForCall = (BigInt(parseCallID(call.callId).options.gasLimit) || BigInt(defaultCallGas)) - BigInt(21000);
      const totalGasForCall = BigInt(FCTOverheadPerPayer) + BigInt(callOverhead) + gasForCall;

      const callCost = totalGasForCall * BigInt(FCTgasPrice);
      const callFee = totalGasForCall * BigInt(effectiveGasPrice);
      const totalCallCost = callCost + callFee;

      const kiroCost = new BigNumber(totalCallCost.toString())
        .multipliedBy(new BigNumber(kiroPriceInETH))
        .shiftedBy(-18 - 18)
        .toNumber();

      return {
        ...acc,
        [payer]: BigNumber(acc[payer as keyof typeof acc] || 0)
          .plus(kiroCost)
          .toString(),
      };
    }, {});
  });

  const allPayers = [
    ...new Set(
      fct.mcall.map((call) => {
        const callId = parseCallID(call.callId);
        const payerIndex = callId.payerIndex;
        const payer = fct.mcall[payerIndex - 1].from;
        return payer;
      })
    ),
  ];

  return allPayers.map((payer) => {
    const amount = data.reduce<string>((acc: string, path) => {
      return BigNumber(acc).isGreaterThan(path[payer as keyof typeof path] || "0")
        ? acc
        : path[payer as keyof typeof path] || "0";
    }, "0");
    return {
      payer,
      amount,
      amountInETH: BigNumber(amount)
        .div(BigNumber(kiroPriceInETH).shiftedBy(18))
        .multipliedBy(penalty || 1)
        .toString(),
    };
  });
};
