import { ChainId, getPlugin } from "@kirobo/ki-eth-fct-provider-ts";
import BigNumber from "bignumber.js";
import { BigNumber as BigNumberEthers, ethers } from "ethers";
import { hexlify } from "ethers/lib/utils";
import Ganache from "ganache";

import FCTActuatorABI from "../abi/FCT_Actuator.abi.json";
import BatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import { parseCallID } from "../batchMultiSigCall/helpers";
import { TypedDataLimits } from "../batchMultiSigCall/types";
import { getAllFCTPaths } from "./FCT";
import { EIP1559GasPrice, IFCT, ITxValidator, LegacyGasPrice } from "./types";

export const transactionValidator = async (txVal: ITxValidator, pureGas = false) => {
  const { callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl, activateForFree } = txVal;

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  const gasPrice = txVal.eip1559
    ? (
        await getGasPrices({
          rpcUrl,
        })
      )[txVal.gasPriority || "average"]
    : { gasPrice: (await provider.getGasPrice()).mul(11).div(10).toNumber() };

  try {
    const ganacheProvider = new ethers.providers.Web3Provider(
      Ganache.provider({
        fork: {
          url: rpcUrl,
        },
      })
    );

    const signer = new ethers.Wallet(actuatorPrivateKey, ganacheProvider);
    const actuatorContract = new ethers.Contract(actuatorContractAddress, FCTActuatorABI, signer);

    let gas: BigNumberEthers;
    if (activateForFree) {
      gas = await actuatorContract.estimateGas.activateForFree(callData, signer.address, {
        ...gasPrice,
      });

      const tx = await actuatorContract.activate(callData, signer.address, {
        ...gasPrice,
      });

      const receipt = await tx.wait();
    } else {
      gas = await actuatorContract.estimateGas.activate(callData, signer.address, {
        ...gasPrice,
      });

      const tx = await actuatorContract.activate(callData, signer.address, {
        ...gasPrice,
      });

      const receipt = await tx.wait();

      console.log(receipt);
    }

    // Add 20% to gasUsed value
    const gasUsed = pureGas ? gas.toNumber() : Math.round(gas.toNumber() + gas.toNumber() * 0.2);

    if (txVal.eip1559 && "maxFeePerGas" in gasPrice) {
      return {
        isValid: true,
        txData: { gas: gasUsed, ...(gasPrice as EIP1559GasPrice), type: 2 },
        prices: { gas: gasUsed, gasPrice: gasPrice.maxFeePerGas },
        error: null,
      };
    } else {
      return {
        isValid: true,
        txData: { gas: gasUsed, ...(gasPrice as LegacyGasPrice), type: 1 },
        prices: { gas: gasUsed, gasPrice: (gasPrice as LegacyGasPrice).gasPrice },
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
      prices: {
        gas: 0,
        gasPrice: txVal.eip1559 ? (gasPrice as EIP1559GasPrice).maxFeePerGas : (gasPrice as LegacyGasPrice).gasPrice,
      },
      error: err.reason,
    };
  }
};

export const getGasPrices = async ({
  rpcUrl,
  historicalBlocks = 10,
}: {
  rpcUrl: string;
  historicalBlocks?: number;
}) => {
  function avg(arr: number[]) {
    const sum = arr.reduce((a, v) => a + v);
    return Math.round(sum / arr.length);
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const latestBlock = await provider.getBlock("latest");

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
      params: [historicalBlocks, hexlify(blockNumber), [5, 15, 30, 75]],
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
  const fastest = avg(blocks.map((b) => b.priorityFeePerGas[3]));

  const baseFeePerGas = Number(baseFee);

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
    fastest: {
      maxFeePerGas: fastest + baseFeePerGas,
      maxPriorityFeePerGas: fastest,
    },
  };
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

// 34.910655705373187788
export const getKIROPayment = async ({
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

  const baseGasCost = gasInt * gasPriceFormatted;

  const limits = fct.typedData.message.limits as TypedDataLimits;
  const maxGasPrice = limits.gas_price_limit;

  // 1000 - baseFee
  // 5000 - bonusFee

  const effectiveGasPrice =
    (gasPriceFormatted * BigInt(10000 + 1000) + (BigInt(maxGasPrice) - gasPriceFormatted) * BigInt(5000)) /
    BigInt(10000);

  const feeGasCost = gasInt * (effectiveGasPrice - gasPriceFormatted);
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

export const getMaxKIROCostPerPayer = ({ fct, kiroPriceInETH }: { fct: IFCT; kiroPriceInETH: string }) => {
  const allPaths = getAllFCTPaths(fct);
  const FCTOverhead = 135500;
  const callOverhead = 16370;

  const defaultCallGas = 50000;

  const limits = fct.typedData.message.limits as TypedDataLimits;
  const maxGasPrice = limits.gas_price_limit;

  const data = allPaths.map((path) => {
    const FCTOverheadPerPayer = (FCTOverhead / path.length).toFixed(0);

    return path.reduce((acc, callIndex) => {
      const call = fct.mcall[callIndex];
      const callId = parseCallID(call.callId);
      const payerIndex = callId.payerIndex;
      const payer = fct.mcall[payerIndex - 1].from;

      const gasForCall = BigInt(parseCallID(call.callId).options.gasLimit) || BigInt(defaultCallGas);

      const callFee = (BigInt(FCTOverheadPerPayer) + BigInt(callOverhead) + gasForCall) * BigInt(maxGasPrice);

      const normalisedKiroPriceInETH = BigNumber(kiroPriceInETH);

      const kiroCost = BigNumber(callFee.toString()).multipliedBy(normalisedKiroPriceInETH).shiftedBy(-36).toNumber();

      return {
        ...acc,
        [payer]: BigNumber(acc[payer] || 0)
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
    return {
      payer,
      amount: data.reduce<string>((acc: string, path) => {
        return BigNumber(acc).isGreaterThan(path[payer] || "0") ? acc : path[payer] || "0";
      }, "0"),
    };
  });
};
