import { ethers } from "ethers";

import { BatchMultiSigCall } from "../batchMultiSigCall";
import { Interfaces } from "../helpers/Interfaces";
import { EIP1559GasPrice, ITxValidatorV2 } from "../types";
import { TransactionValidatorResultV2, TxValidatorExecutionData } from "./types";

const ErrorFunctionSignature = "0x08c379a0"; // keccak256("Error(string)")
const BatchMultiSigErrorSignature = "0xb2685b70";

const BatchMultiSigErrorInterface = new ethers.utils.Interface([
  {
    inputs: [
      {
        internalType: "string",
        name: "message",
        type: "string",
      },
      {
        components: [
          {
            internalType: "enum CallStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "bytes",
            name: "values",
            type: "bytes",
          },
        ],
        internalType: "struct CallReturn[]",
        name: "callsReturn",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "address",
            name: "target",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "ensHash",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "sessionId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "callId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct CallData[]",
        name: "callsData",
        type: "tuple[]",
      },
    ],
    name: "ErrorThrowMulti",
    type: "error",
  },
]);

export const transactionValidatorV2 = async (txVal: ITxValidatorV2): Promise<TransactionValidatorResultV2> => {
  const { actuatorContractAddress, activator, rpcUrl, activateForFree, FCT, signatures, optionalExecutionValues } =
    txVal;
  let { gasPrice } = txVal;

  const { dryRun } = FCT.options;
  const version = FCT.version;
  gasPrice = manageGasPrice({ gasPrice, dryRun });

  const exportedFct = prepareFCT({
    FCT,
    forceDryRun: true,
    optionalExecutionValues,
    signatures,
  });

  const callData = BatchMultiSigCall.utils.getCalldataForActuator({
    signedFCT: exportedFct,
    activator,
    investor: ethers.constants.AddressZero,
    purgedFCT: ethers.constants.HashZero,
    version,
  });

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
    const gasUsed = Math.round(gas.toNumber() + gas.toNumber() * 0.75);

    return {
      isValid: true,
      callData,
      txData: { gas: gasUsed, ...gasPrice, type: 2 },
      prices: { gas: gasUsed, gasPrice: gasPrice.maxFeePerGas },
      error: null,
    };
  } catch (err: any) {
    return await handleTxValidatorError({
      err,
      gasPrice,
      failingCallData: callData,
      errorIsValid: txVal.errorIsValid,
      version,
      FCT,
      txVal,
    });
  }
};

function manageGasPrice({ dryRun, gasPrice }: { gasPrice: EIP1559GasPrice; dryRun: boolean }) {
  if (dryRun) {
    return { maxFeePerGas: "0", maxPriorityFeePerGas: "0" };
  }
  // if (BigInt(maxGasPrice) < BigInt(gasPrice.maxFeePerGas)) {
  //   return { maxFeePerGas: maxGasPrice.toString(), maxPriorityFeePerGas: "0" };
  // }
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

async function handleTxValidatorError({
  FCT,
  err,
  gasPrice,
  failingCallData,
  errorIsValid,
  version,
  txVal,
}: {
  FCT: BatchMultiSigCall;
  err: any;
  gasPrice: EIP1559GasPrice;
  failingCallData: string;
  errorIsValid?: boolean;
  version: string;
  txVal: ITxValidatorV2;
}) {
  const vAsNumber = parseInt(version, 16);
  if (vAsNumber >= 0x20201) {
    return await handleTxValidatorErrorV2({ err, gasPrice, errorIsValid, FCT, txVal, failingCallData });
  }
  return handleTxValidatorError_oldVersion({ err, gasPrice, errorIsValid, failingCallData });
}

async function handleTxValidatorErrorV2({
  FCT,
  txVal,
  err,
  failingCallData,
  gasPrice,
  errorIsValid,
}: {
  FCT: BatchMultiSigCall;
  txVal: ITxValidatorV2;
  failingCallData: string;
  err: any;
  gasPrice: EIP1559GasPrice;
  errorIsValid?: boolean;
}): Promise<TransactionValidatorResultV2> {
  const message = (err?.error?.error?.data || "") as string;

  let errorMessage: string;
  let executionData = {
    callsReturn: [],
    callsData: [],
  };

  if (message.startsWith(BatchMultiSigErrorSignature)) {
    const error = BatchMultiSigErrorInterface.decodeErrorResult("ErrorThrowMulti", message);
    errorMessage = error.message;
    executionData = {
      callsReturn: error.callsReturn.map((callReturn) => ({
        status: callReturn.status,
        values: callReturn[1],
      })),
      callsData: error.callsData.map((callData) => ({
        target: callData.target,
        ensHash: callData.ensHash,
        value: callData.value.toString(),
        sessionId: callData.sessionId.toHexString(),
        callId: callData.callId.toHexString(),
        data: callData.data,
      })),
    };
  } else if (message.startsWith(ErrorFunctionSignature)) {
    const innerMessage = message.slice(10);
    const decoded = ethers.utils.defaultAbiCoder.decode(["string"], "0x" + innerMessage);

    errorMessage = decoded[0];
    executionData = {
      callsReturn: [],
      callsData: [],
    };
  } else {
    errorMessage = err?.error?.reason;
    // If error doesnt have reason, try to take
    // error.body, parse it and take message.
    // Else just use error message worst case scenario.
    //
    // error decoding done in order of accuracy and precision.
    if (!errorMessage) {
      const parsedErrorMessage = err?.error?.error?.body ? JSON.parse(err.error.error.body)?.error?.message : null;
      errorMessage = parsedErrorMessage ?? err.error.message;
    }

    executionData = {
      callsReturn: [],
      callsData: [],
    };
  }

  if (errorMessage.includes("dry run success")) {
    const exportedFct = prepareFCT({
      FCT,
      forceDryRun: false,
      optionalExecutionValues: txVal.optionalExecutionValues,
      signatures: txVal.signatures,
    });

    const callData = BatchMultiSigCall.utils.getCalldataForActuator({
      signedFCT: exportedFct,
      activator: txVal.activator,
      investor: ethers.constants.AddressZero,
      purgedFCT: ethers.constants.HashZero,
      version: FCT.version,
    });

    const gas = await estimateGas({
      rpcUrl: txVal.rpcUrl,
      actuatorContractAddress: txVal.actuatorContractAddress,
      activateForFree: txVal.activateForFree,
      callData,
      activator: txVal.activator,
      gasPrice,
    });

    const gasUsed = Math.round(gas.toNumber() + gas.toNumber() * 0.25);

    return {
      isValid: true,
      txData: { gas: gasUsed, ...gasPrice, type: 2 },
      callData,
      prices: {
        gas: gasUsed,
        gasPrice: gasPrice.maxFeePerGas,
      },
      error: null,
      executionData,
    };
  }
  if (errorIsValid) {
    return {
      isValid: true,
      txData: { gas: 1_000_000, ...gasPrice, type: 2 },
      callData: failingCallData,
      prices: {
        gas: 1_000_000, // 900k is the default gas limit
        gasPrice: (gasPrice as EIP1559GasPrice).maxFeePerGas,
      },
      error: null,
      executionData,
    };
  }

  return {
    isValid: false,
    txData: { gas: 0, ...gasPrice, type: 2 },
    callData: failingCallData,
    prices: {
      gas: 0,
      gasPrice: (gasPrice as EIP1559GasPrice).maxFeePerGas,
    },
    error: errorMessage,
    executionData,
  };
}

function handleTxValidatorError_oldVersion({
  err,
  gasPrice,
  errorIsValid,
  failingCallData,
}: {
  err: any;
  errorIsValid?: boolean;
  gasPrice: EIP1559GasPrice;
  failingCallData: string;
}): TransactionValidatorResultV2 {
  if (err.reason.includes("dry run success")) {
    return {
      isValid: true,
      txData: { gas: 0, ...gasPrice, type: 2 },
      callData: failingCallData,
      prices: {
        gas: 0,
        gasPrice: gasPrice.maxFeePerGas,
      },
      error: null,
      executionData: {
        callsReturn: [] as TxValidatorExecutionData["callsReturn"],
        callsData: [] as TxValidatorExecutionData["callsData"],
      },
    };
  }
  if (err.code === "SERVER_ERROR") {
    return {
      isValid: false,
      txData: { gas: 0, ...gasPrice, type: 2 },
      callData: failingCallData,
      prices: {
        gas: 0,
        gasPrice: (gasPrice as EIP1559GasPrice).maxFeePerGas,
      },
      error: err.error.message || err.error,
      executionData: {
        callsReturn: [] as TxValidatorExecutionData["callsReturn"],
        callsData: [] as TxValidatorExecutionData["callsData"],
      },
    };
  }
  if (errorIsValid) {
    return {
      isValid: true,
      txData: { gas: 1_000_000, ...gasPrice, type: 2 },
      callData: failingCallData,
      prices: {
        gas: 1_000_000, // 900k is the default gas limit
        gasPrice: (gasPrice as EIP1559GasPrice).maxFeePerGas,
      },
      error: null,
      executionData: {
        callsReturn: [] as TxValidatorExecutionData["callsReturn"],
        callsData: [] as TxValidatorExecutionData["callsData"],
      },
    };
  }

  let error = err.reason;

  // If error.data starts with the Error(string) sig, decode it
  if (!error && err.data.startsWith(ErrorFunctionSignature)) {
    // Need to decode the error message from the data
    // 1. Remove the Error(string) signature
    // 2. Decode the message
    const message = err.data.slice(10);
    const decoded = ethers.utils.defaultAbiCoder.decode(["string"], "0x" + message);
    error = decoded;
  } else if (!error) {
    error = err.message;
  }

  return {
    isValid: false,
    txData: { gas: 0, ...gasPrice, type: 2 },
    callData: failingCallData,
    prices: {
      gas: 0,
      gasPrice: (gasPrice as EIP1559GasPrice).maxFeePerGas,
    },
    error: err.reason ? err.reason : err.message,
    executionData: {
      callsReturn: [] as TxValidatorExecutionData["callsReturn"],
      callsData: [] as TxValidatorExecutionData["callsData"],
    },
  };
}

function prepareFCT({
  FCT,
  forceDryRun = false,
  optionalExecutionValues,
  signatures,
}: {
  FCT: BatchMultiSigCall;
  forceDryRun?: boolean;
  optionalExecutionValues?: ITxValidatorV2["optionalExecutionValues"];
  signatures: any[];
}) {
  const exportedFCT = FCT.export({ forceDryRun });
  exportedFCT.signatures = signatures;

  if (optionalExecutionValues) {
    if (optionalExecutionValues.externalSigners) {
      exportedFCT.externalSigners = optionalExecutionValues.externalSigners;
    }
    if (optionalExecutionValues.variables) {
      exportedFCT.variables = optionalExecutionValues.variables;
    }
  }
  return exportedFCT;
}
