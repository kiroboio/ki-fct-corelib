import { ethers } from "ethers";

import { parseSessionId } from "../batchMultiSigCall/versions/getVersion";
import { Interfaces } from "../helpers/Interfaces";
import { EIP1559GasPrice, ITxValidator } from "../types";
import { TransactionValidatorResult } from "./types";

const ErrorFunctionSignature = "0x08c379a0"; // keccak256("Error(string)")
const ErrorInterface = new ethers.utils.Interface(["error Error(string message)"]);

export const transactionValidator = async (txVal: ITxValidator): Promise<TransactionValidatorResult> => {
  const { callData, actuatorContractAddress, activator, rpcUrl, activateForFree } = txVal;
  let { gasPrice } = txVal;

  const decodedFCTCalldata = Interfaces.FCT_BatchMultiSigCall.decodeFunctionData("batchMultiSigCall", callData);
  const parsedSessionId = parseSessionId(decodedFCTCalldata[1].sessionId.toHexString());
  const { maxGasPrice, dryRun } = parsedSessionId;
  gasPrice = manageGasPrice({ gasPrice, maxGasPrice, dryRun });

  try {
    const gas = await estimateGas({
      rpcUrl,
      actuatorContractAddress,
      activateForFree,
      callData,
      activator,
      gasPrice,
    });

    if (gas.lt(40000)) {
      throw new Error("Unknown error - FCT execution finalized too quickly. Is there enough power for user?");
    }

    // Add 20% to gasUsed value, calculate with BigInt
    const gasUsed = Math.round(gas.toNumber() + gas.toNumber() * 0.2);

    return {
      isValid: true,
      txData: { gas: gasUsed, ...gasPrice, type: 2 },
      prices: { gas: gasUsed, gasPrice: gasPrice.maxFeePerGas },
      error: null,
    };
  } catch (err: any) {
    return handleTxValidatorError({
      err,
      dryRun,
      gasPrice,
      errorIsValid: txVal.errorIsValid,
    });
  }
};

function manageGasPrice({
  dryRun,
  gasPrice,
  maxGasPrice,
}: {
  gasPrice: EIP1559GasPrice;
  maxGasPrice: string;
  dryRun: boolean;
}) {
  if (dryRun) {
    return { maxFeePerGas: "0", maxPriorityFeePerGas: "0" };
  }
  if (BigInt(maxGasPrice) < BigInt(gasPrice.maxFeePerGas)) {
    return { maxFeePerGas: maxGasPrice.toString(), maxPriorityFeePerGas: "0" };
  }
  return gasPrice;
}

async function estimateGas({
  rpcUrl,
  actuatorContractAddress,
  activateForFree,
  callData,
  activator,
  gasPrice,
}: {
  rpcUrl: string;
  actuatorContractAddress: string;
  activateForFree: boolean;
  callData: string;
  activator: string;
  gasPrice: EIP1559GasPrice;
}) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const data = Interfaces.FCT_Actuator.encodeFunctionData(activateForFree ? "activateForFree" : "activate", [
    callData,
    activator,
  ]);
  return await provider.estimateGas({
    to: actuatorContractAddress,
    data,
    ...gasPrice,
    from: activator,
  });
}

function handleTxValidatorError({
  err,
  dryRun,
  gasPrice,
  errorIsValid,
}: {
  err: any;
  dryRun: boolean;
  gasPrice: EIP1559GasPrice;
  errorIsValid?: boolean;
}): TransactionValidatorResult {
  if (dryRun && err.reason.includes("dry run success")) {
    return {
      isValid: true,
      txData: { gas: 0, ...gasPrice, type: 2 },
      prices: {
        gas: 0,
        gasPrice: gasPrice.maxFeePerGas,
      },
      error: null,
    };
  }
  if (err.code === "SERVER_ERROR") {
    return {
      isValid: false,
      txData: { gas: 0, ...gasPrice, type: 2 },
      prices: {
        gas: 0,
        gasPrice: (gasPrice as EIP1559GasPrice).maxFeePerGas,
      },
      error: err.error.message || err.error,
    };
  }
  if (errorIsValid) {
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

  let error = err.reason;

  // If error.data starts with the Error(string) sig, decode it
  if (!error && err.data.startsWith(ErrorFunctionSignature)) {
    const decoded = ErrorInterface.decodeFunctionResult("Error", err.data);
    error = decoded.message;
  } else if (!error) {
    error = err.message;
  }

  return {
    isValid: false,
    txData: { gas: 0, ...gasPrice, type: 2 },
    prices: {
      gas: 0,
      gasPrice: (gasPrice as EIP1559GasPrice).maxFeePerGas,
    },
    error,
  };
}
