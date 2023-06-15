import { ethers } from "ethers";

import FCTActuatorABI from "../abi/FCT_Actuator.abi.json";
import { Interfaces } from "../helpers/Interfaces";
import { SessionID } from "../methods/batchMultiSigCall/classes";
import { EIP1559GasPrice, ITxValidator } from "../types";
import { TransactionValidatorResult } from "./types";

export const transactionValidator = async (txVal: ITxValidator): Promise<TransactionValidatorResult> => {
  const { callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl, activateForFree, gasPrice } = txVal;

  const decodedFCTCalldata = Interfaces.FCT_BatchMultiSigCall.decodeFunctionData("batchMultiSigCall", callData);
  const { maxGasPrice } = SessionID.parse(decodedFCTCalldata[1].sessionId.toHexString());

  if (BigInt(maxGasPrice) < BigInt(gasPrice.maxFeePerGas)) {
    return {
      isValid: false,
      txData: { gas: 0, ...gasPrice, type: 2 },
      prices: {
        gas: 0,
        gasPrice: (gasPrice as EIP1559GasPrice).maxFeePerGas,
      },
      error: "Max gas price set for the FCT is too high",
    };
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(actuatorPrivateKey, provider);
  const actuatorContract = new ethers.Contract(actuatorContractAddress, FCTActuatorABI, signer);

  try {
    const gas = await actuatorContract.estimateGas[activateForFree ? "activateForFree" : "activate"](
      callData,
      signer.address,
      { ...gasPrice }
    );

    // Add 20% to gasUsed value, calculate with BigInt
    const gasUsed = Math.round(gas.toNumber() + gas.toNumber() * 0.2);

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
