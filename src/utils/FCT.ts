import { recoverTypedSignature, SignTypedDataVersion, TypedDataUtils, TypedMessage } from "@metamask/eth-sig-util";
import { SignatureLike } from "@ethersproject/bytes";
import { ethers, utils } from "ethers";
import { BatchMultiSigCallTypedData, TypedDataLimits, TypedDataMeta, TypedDataTypes } from "../batchMultiSigCall/types";
import { IFCT } from "./types";

export const recoverAddressFromEIP712 = (
  typedData: BatchMultiSigCallTypedData,
  signature: SignatureLike
): string | null => {
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

export const getFCTMessageHash = (typedData: BatchMultiSigCallTypedData) => {
  // Return FCT Message hash
  return ethers.utils.hexlify(
    TypedDataUtils.eip712Hash(typedData as unknown as TypedMessage<TypedDataTypes>, SignTypedDataVersion.V4)
  );
};

export const validateFCT = (FCT: IFCT, softValidation: boolean = false) => {
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

export const getVariablesAsBytes32 = (variables: string[]) => {
  return variables.map((v) => {
    if (isNaN(Number(v)) || utils.isAddress(v)) {
      return `0x${String(v).replace("0x", "").padStart(64, "0")}`;
    }

    return `0x${Number(v).toString(16).padStart(64, "0")}`;
  });
};
