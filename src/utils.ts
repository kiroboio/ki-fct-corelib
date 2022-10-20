import { SignatureLike } from "@ethersproject/bytes";
import { ethers, utils } from "ethers";
import { TypedData, TypedDataUtils } from "ethers-eip712";
import { MSCall } from "./batchMultiSigCall/interfaces";
import ganache from "ganache";
import FCTActuatorABI from "./abi/FCT_Actuator.abi.json";
interface IFCTTypedData extends TypedData {
  message: {
    limits: {
      valid_from: string;
      expires_at: string;
      gas_price_limit: string;
      purgeable: boolean;
      cancelable: boolean;
    };
    fct: {
      eip712: boolean;
      builder: string;
    };
  };
}

interface IFCT {
  typedData: IFCTTypedData;
  mcall: MSCall[];
}

interface ITxValidator {
  rpcUrl: string;
  callData: string;
  actuatorPrivateKey: string;
  actuatorContractAddress: string;
}

const transactionValidator = async (transactionValidatorInterface: ITxValidator) => {
  const { callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl } = transactionValidatorInterface;

  // Creates a forked ganache instance from indicated chainId's rpcUrl
  const ganacheProvider = ganache.provider({
    fork: {
      url: rpcUrl,
    },
  }) as any;

  const provider = new ethers.providers.Web3Provider(ganacheProvider);
  const signer = new ethers.Wallet(actuatorPrivateKey, provider);

  const actuatorContract = new ethers.utils.Interface(FCTActuatorABI);

  const tx = await signer.sendTransaction({
    to: actuatorContractAddress,
    data: actuatorContract.encodeFunctionData("activate", [callData]),
  });

  const receipt = await tx.wait();

  return {
    isValid: true,
    gasUsed: receipt.gasUsed,
  };
};

const recoverAddressFromEIP712 = (typedData: TypedData, signature: SignatureLike): string | null => {
  try {
    const messageHash = ethers.utils.arrayify(TypedDataUtils.encodeDigest(typedData));
    return ethers.utils.recoverAddress(messageHash, signature);
  } catch (e) {
    return null;
  }
};

const getFCTMessageHash = (typedData: TypedData) => {
  return ethers.utils.hexlify(TypedDataUtils.encodeDigest(typedData));
};

const validateFCT = (FCT: IFCT, softValidation: boolean = false) => {
  const limits = FCT.typedData.message.limits;
  const fctData = FCT.typedData.message.fct;

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
