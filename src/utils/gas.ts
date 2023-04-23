import { BigNumber as BigNumberEthers, ethers } from "ethers";

import FCTActuatorABI from "../abi/FCT_Actuator.abi.json";
import { SessionID } from "../batchMultiSigCall/classes";
import { Interface } from "../helpers/Interfaces";
import { EIP1559GasPrice, ITxValidator } from "../types";

const gasPriceCalculationsByChains = {
  5: (maxFeePerGas: number) => {
    // If maxFeePerGas < 70 gwei, add 15% to maxFeePerGas
    if (maxFeePerGas < 70_000_000_000) {
      return Math.round(maxFeePerGas + maxFeePerGas * 0.15);
    }
    // If maxFeePerGas < 100 gwei, add 10% to maxFeePerGas
    if (maxFeePerGas < 100_000_000_000) {
      return Math.round(maxFeePerGas + maxFeePerGas * 0.1);
      3;
    }
    // If maxFeePerGas > 200 gwei, add 5% to maxFeePerGas
    if (maxFeePerGas > 200_000_000_000) {
      return Math.round(maxFeePerGas + maxFeePerGas * 0.05);
    }
    return maxFeePerGas;
  },
  1: (maxFeePerGas: number) => maxFeePerGas,
};

interface TransactionValidatorSuccess {
  isValid: true;
  txData: { gas: number; type: 2 } & EIP1559GasPrice;
  prices: { gas: number; gasPrice: number };
  error: null;
}

interface TransactionValidatorError {
  isValid: false;
  txData: { gas: number; type: 2 } & EIP1559GasPrice;
  prices: { gas: number; gasPrice: number };
  error: string;
}

type TransactionValidatorResult = TransactionValidatorSuccess | TransactionValidatorError;

export const transactionValidator = async (
  txVal: ITxValidator,
  pureGas = false
): Promise<TransactionValidatorResult> => {
  const { callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl, activateForFree, gasPrice } = txVal;

  const decodedFCTCalldata = Interface.FCT_BatchMultiSigCall.decodeFunctionData(
    "batchMultiSigCall",
    Interface.FCT_Actuator.decodeFunctionData(activateForFree ? "activateForFree" : "activate", callData)[0]
  );
  const { maxGasPrice } = SessionID.parse(decodedFCTCalldata[1].sessionId.toHexString());

  if (BigInt(maxGasPrice) > BigInt(gasPrice.maxFeePerGas)) {
    return {
      isValid: false,
      txData: { gas: 0, ...gasPrice, type: 2 },
      prices: {
        gas: 0,
        gasPrice: (gasPrice as EIP1559GasPrice).maxFeePerGas,
      },
      error: "Max gas price for FCT is too high",
    };
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(actuatorPrivateKey, provider);
  const actuatorContract = new ethers.Contract(actuatorContractAddress, FCTActuatorABI, signer);

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

    return {
      isValid: true,
      txData: { gas: gasUsed, ...gasPrice, type: 2 },
      prices: { gas: gasUsed, gasPrice: gasPrice.maxFeePerGas },
      error: null,
    };
  } catch (err: any) {
    if (err.reason === "processing response error") {
      throw err;
    }
    if (txVal.errorIsValid) {
      return {
        isValid: true,
        txData: { gas: 1_000_000, ...gasPrice, type: 2 },
        prices: {
          gas: 1_000_000, // 900k is the default gas limit
          gasPrice: (gasPrice as EIP1559GasPrice).maxFeePerGas,
        },
        error: null,
      };
    }
    return {
      isValid: false,
      txData: { gas: 0, ...gasPrice, type: 2 },
      prices: {
        gas: 0,
        gasPrice: (gasPrice as EIP1559GasPrice).maxFeePerGas,
      },
      error: err.reason,
    };
  }
};

export const getGasPrices = async ({
  rpcUrl,
  chainId,
  historicalBlocks = 10,
  tries = 40,
}: {
  rpcUrl: string;
  chainId: number;
  historicalBlocks?: number;
  tries?: number;
}): Promise<Record<"slow" | "average" | "fast" | "fastest", EIP1559GasPrice>> => {
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

      const generateBody = () => {
        return JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_feeHistory",
          params: [historicalBlocks, `0x${blockNumber.toString(16)}`, [2, 5, 15, 25]],
          id: 1,
        });
      };

      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: generateBody(),
      });
      const data = await res.json();
      const result = data.result;

      if (!result) {
        throw new Error("No result");
      }

      let blockNum = parseInt(result.oldestBlock, 16);
      let index = 0;
      const blocks: {
        number: number;
        baseFeePerGas: number;
        gasUsedRatio: number;
        priorityFeePerGas: number[];
      }[] = [];

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
      // Add 5% to fast and fastest
      const fast = avg(blocks.map((b) => b.priorityFeePerGas[2]));
      const fastest = avg(blocks.map((b) => b.priorityFeePerGas[3]));
      const baseFeePerGas = Number(baseFee);

      const gasPriceCalc =
        gasPriceCalculationsByChains[chainId as keyof typeof gasPriceCalculationsByChains] ||
        gasPriceCalculationsByChains[1];

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
          maxFeePerGas: gasPriceCalc(fast + baseFeePerGas),
          maxPriorityFeePerGas: fast,
        },
        fastest: {
          maxFeePerGas: gasPriceCalc(fastest + baseFeePerGas),
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

// 38270821632831754769812 - kiro price
// 1275004198 - max fee
// 462109 - gas
