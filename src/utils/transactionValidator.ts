import { ethers } from "ethers";

import FCTActuatorABI from "../abi/FCT_Actuator.abi.json";
import { SessionID } from "../batchMultiSigCall/classes";
import { Interfaces } from "../helpers/Interfaces";
import { EIP1559GasPrice, ITxValidator } from "../types";
import { TransactionValidatorResult } from "./types";

export const transactionValidator = async (txVal: ITxValidator): Promise<TransactionValidatorResult> => {
  const { callData, actuatorContractAddress, activator, rpcUrl, activateForFree } = txVal;
  let { gasPrice } = txVal;

  const decodedFCTCalldata = Interfaces.FCT_BatchMultiSigCall.decodeFunctionData("batchMultiSigCall", callData);
  const { maxGasPrice, dryRun } = SessionID.parse(decodedFCTCalldata[1].sessionId.toHexString());
  if (dryRun) {
    gasPrice = { maxFeePerGas: "0", maxPriorityFeePerGas: "0" };
  } else {
    if (BigInt(maxGasPrice) < BigInt(gasPrice.maxFeePerGas)) {
      gasPrice = { maxFeePerGas: maxGasPrice.toString(), maxPriorityFeePerGas: "0" };
    }
  }

  // if (!dryRun && BigInt(maxGasPrice) < BigInt(gasPrice.maxFeePerGas)) {
  //   const networkFeeInGwei = ethers.utils.formatUnits(gasPrice.maxFeePerGas.toString(), "gwei");
  //   const fctMaxGasPriceInGwei = ethers.utils.formatUnits(maxGasPrice.toString(), "gwei");
  //   return {
  //     isValid: false,
  //     txData: { gas: 0, ...gasPrice, type: 2 },
  //     prices: {
  //       gas: 0,
  //       gasPrice: (gasPrice as EIP1559GasPrice).maxFeePerGas,
  //     },
  //     error: `Network gas price (${networkFeeInGwei} Gwei) is higher than FCT max gas price (${fctMaxGasPriceInGwei} Gwei)`,
  //   };
  // }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  // const signer = new ethers.Wallet(actuatorPrivateKey, provider);
  const actuatorContract = new ethers.Contract(actuatorContractAddress, FCTActuatorABI, provider);

  try {
    // const gas = await actuatorContract.estimateGas[activateForFree ? "activateForFree" : "activate"](
    //   callData,
    //   "0x19B272A2f2C5B4673057397390909757a0033633",
    //   { ...gasPrice },
    // );

    const gas = await provider.estimateGas({
      to: actuatorContractAddress,
      data: actuatorContract.interface.encodeFunctionData(activateForFree ? "activateForFree" : "activate", [
        callData,
        activator,
      ]),
      ...gasPrice,
      from: activator,
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
      error: err.reason ? err.reason : err.message,
    };
  }
};
