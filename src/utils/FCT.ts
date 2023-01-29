import { SignatureLike } from "@ethersproject/bytes";
import { recoverTypedSignature, SignTypedDataVersion, TypedDataUtils, TypedMessage } from "@metamask/eth-sig-util";
import { ethers, utils } from "ethers";
import { Graph } from "graphlib";

import { parseCallID, parseSessionID } from "../batchMultiSigCall/helpers";
import { BatchMultiSigCallTypedData, IBatchMultiSigCallFCT, TypedDataTypes } from "../batchMultiSigCall/types";
import { IFCT } from "./types";

function isFCTKeyType(keyInput: string): keyInput is keyof IBatchMultiSigCallFCT {
  return [
    "typeHash",
    "typedData",
    "sessionId",
    "nameHash",
    "mcall",
    "builder",
    "variables",
    "externalSigners",
    "computed",
  ].includes(keyInput);
}

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

export const getFCTMessageHash = (typedData: BatchMultiSigCallTypedData): string => {
  return ethers.utils.hexlify(
    TypedDataUtils.eip712Hash(typedData as unknown as TypedMessage<TypedDataTypes>, SignTypedDataVersion.V4)
  );
};

export const validateFCT = <IFCT extends IBatchMultiSigCallFCT>(FCT: IFCT, softValidation = false) => {
  const keys = Object.keys(FCT);

  if (!keys.every(isFCTKeyType)) {
    throw new Error(`FCT has invalid keys`);
  }

  const limits = FCT.typedData.message.limits;
  const fctData = FCT.typedData.message.meta;

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
      const parsedSessionID = parseSessionID(FCT.sessionId, fctData.builder);

      return {
        valid_from: parsedSessionID.validFrom,
        expires_at: parsedSessionID.expiresAt,
        gas_price_limit: parsedSessionID.maxGasPrice,
        blockable: parsedSessionID.blockable,
        purgeable: parsedSessionID.purgeable,
        builder: parsedSessionID.builder,
        recurrency: parsedSessionID.recurrency,
        multisig: parsedSessionID.multisig,
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

export const getAllFCTPaths = (fct: IFCT) => {
  const g = new Graph({ directed: true });

  fct.mcall.forEach((_, index) => {
    g.setNode(index.toString());
  });

  for (let i = 0; i < fct.mcall.length - 1; i++) {
    const callID = parseCallID(fct.mcall[i].callId, true);
    const jumpOnSuccess = callID.options.jumpOnSuccess;
    const jumpOnFail = callID.options.jumpOnFail;

    if (jumpOnSuccess === jumpOnFail) {
      g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
    } else {
      g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
      g.setEdge(i.toString(), (i + 1 + Number(jumpOnFail)).toString());
    }
  }

  const allPaths: string[][] = [];

  const isVisited = {};
  const pathList: string[] = [];
  const start = "0";
  const end = (fct.mcall.length - 1).toString();

  pathList.push(start);

  const printAllPathsUtil = (g: Graph, start: string, end: string, isVisited: object, localPathList: string[]) => {
    if (start === end) {
      const path = localPathList.slice();

      allPaths.push(path);
      return;
    }

    isVisited[start] = true;

    let successors = g.successors(start);

    if (successors === undefined) {
      successors = [];
    }

    for (const id of successors as string[]) {
      if (!isVisited[id]) {
        // store current node
        // in path[]
        localPathList.push(id);

        printAllPathsUtil(g, id, end, isVisited, localPathList);

        // remove current node
        // in path[]
        localPathList.splice(localPathList.indexOf(id), 1);
      }
    }

    isVisited[start] = false;
  };

  printAllPathsUtil(g, start, end, isVisited, pathList);

  return allPaths;
};
