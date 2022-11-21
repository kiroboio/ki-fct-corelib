import { SignatureLike } from "@ethersproject/bytes";
import { BigNumber, ethers, utils } from "ethers";
import {
  BatchMultiSigCallTypedData,
  MSCall,
  TypedDataLimits,
  TypedDataMeta,
  TypedDataTypes,
} from "./batchMultiSigCall/interfaces";
import FCTActuatorABI from "./abi/FCT_Actuator.abi.json";
import { recoverTypedSignature, SignTypedDataVersion, TypedDataUtils, TypedMessage } from "@metamask/eth-sig-util";

interface IFCT {
  typedData: BatchMultiSigCallTypedData;
  mcall: MSCall[];
}

interface ITxValidator {
  rpcUrl: string;
  callData: string;
  actuatorPrivateKey: string;
  actuatorContractAddress: string;
  activateForFree: boolean;
}

const transactionValidator = async (transactionValidatorInterface: ITxValidator, pureGas = false) => {
  const { callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl, activateForFree } =
    transactionValidatorInterface;

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const gasPrice = await provider.getGasPrice();
  const signer = new ethers.Wallet(actuatorPrivateKey, provider);

  const actuatorContract = new ethers.Contract(actuatorContractAddress, FCTActuatorABI, signer);

  try {
    let gas: BigNumber;
    if (activateForFree) {
      gas = await actuatorContract.estimateGas.activateForFree(callData, signer.address, {
        gasPrice,
      });
    } else {
      gas = await actuatorContract.estimateGas.activate(callData, signer.address, {
        gasPrice,
      });
    }

    // Add 15% to gasUsed value
    const gasUsed = pureGas ? gas.toNumber() : Math.round(gas.toNumber() + gas.toNumber() * 0.15);

    return {
      isValid: true,
      gasUsed,
      gasPrice: gasPrice.toNumber(),
      error: null,
    };
  } catch (err: any) {
    return {
      isValid: false,
      gasUsed: 0,
      gasPrice: gasPrice.toNumber(),
      error: err.reason,
    };
  }
};

const recoverAddressFromEIP712 = (typedData: BatchMultiSigCallTypedData, signature: SignatureLike): string | null => {
  try {
    const signatureString = utils.joinSignature(signature);
    const address = recoverTypedSignature<SignTypedDataVersion.V4, TypedDataTypes>({
      data: typedData as unknown as TypedMessage<TypedDataTypes>,
      version: SignTypedDataVersion.V4,
      signature: signatureString,
    });

    return address;
  } catch (e) {
    return null;
  }
};

// TODO: Check if this is the right way to get FCT Message hash
const getFCTMessageHash = (typedData: BatchMultiSigCallTypedData) => {
  // Return FCT Message hash
  return ethers.utils.hexlify(
    TypedDataUtils.eip712Hash(typedData as unknown as TypedMessage<TypedDataTypes>, SignTypedDataVersion.V4)
  );
};

const validateFCT = (FCT: IFCT, softValidation: boolean = false) => {
  const limits = FCT.typedData.message.limits as TypedDataLimits;
  const fctData = FCT.typedData.message.meta as TypedDataMeta;

  const currentDate = new Date().getTime() / 1000;
  const validFrom = parseInt(limits.valid_from);
  const expiresAt = parseInt(limits.expires_at);
  const gasPriceLimit = limits.gas_price_limit;

  if (!softValidation && validFrom > currentDate) {
    throw new Error(`FCT is not valid yet. FCT is valid from ${validFrom}`);
  }

  if (expiresAt < currentDate) {
    throw new Error(`FCT has expired. FCT expired at ${expiresAt}`);
  }

  if (gasPriceLimit === "0") {
    throw new Error(`FCT gas price limit cannot be 0`);
  }

  if (!fctData.eip712) {
    throw new Error(`FCT must be type EIP712`);
  }

  return {
    getOptions: () => {
      return {
        valid_from: limits.valid_from,
        expires_at: limits.expires_at,
        gas_price_limit: limits.gas_price_limit,
        builder: fctData.builder,
      };
    },
    getFCTMessageHash: () => getFCTMessageHash(FCT.typedData),
    getSigners: () => {
      return FCT.mcall.reduce((acc: string[], { from }) => {
        if (!acc.includes(from)) {
          acc.push(from);
        }
        return acc;
      }, []);
    },
  };
};

const getVariablesAsBytes32 = (variables: string[]) => {
  return variables.map((v) => {
    if (isNaN(Number(v)) || utils.isAddress(v)) {
      return `0x${String(v).replace("0x", "").padStart(64, "0")}`;
    }

    return `0x${Number(v).toString(16).padStart(64, "0")}`;
  });
};

export default {
  getFCTMessageHash,
  validateFCT,
  recoverAddressFromEIP712,
  getVariablesAsBytes32,
  transactionValidator,
};
