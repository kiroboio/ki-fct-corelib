import { SignatureLike } from "@ethersproject/bytes";
import { recoverTypedSignature, SignTypedDataVersion, TypedDataUtils, TypedMessage } from "@metamask/eth-sig-util";
import { getAuthenticatorSignature, getCalldataForActuator } from "batchMultiSigCall/utils";
import { ethers, utils } from "ethers";
import { Graph } from "graphlib";
import _ from "lodash";
import { BatchMultiSigCall } from "methods";
import { TypedDataTypes } from "types";

import { CallID } from "../CallID";
import { FCTBase } from "../FCTBase";
import { SessionID } from "../SessionID";

export class FCTUtils extends FCTBase {
  constructor(FCT: BatchMultiSigCall) {
    super(FCT);
  }

  get FCTData() {
    return this.FCT.exportFCT();
  }

  public getCalldataForActuator({
    signatures,
    purgedFCT,
    investor,
    activator,
  }: {
    signatures: SignatureLike[];
    purgedFCT: string;
    investor: string;
    activator: string;
  }): string {
    return getCalldataForActuator({
      signedFCT: _.merge({}, this.FCTData, { signatures }),
      purgedFCT,
      investor,
      activator,
      version: this.FCT.version.slice(2),
    });
  }

  public getAuthenticatorSignature(): SignatureLike {
    return getAuthenticatorSignature(this.FCT._eip712.getTypedData());
  }

  public recoverAddress(signature: SignatureLike): string | null {
    try {
      const signatureString = utils.joinSignature(signature);
      return recoverTypedSignature<SignTypedDataVersion.V4, TypedDataTypes>({
        data: this.FCTData.typedData as unknown as TypedMessage<TypedDataTypes>,
        version: SignTypedDataVersion.V4,
        signature: signatureString,
      });
    } catch (e) {
      return null;
    }
  }

  public getOptions() {
    const parsedSessionID = SessionID.asOptions({
      builder: this.FCTData.builder,
      sessionId: this.FCTData.sessionId,
      name: "",
    });

    return {
      valid_from: parsedSessionID.validFrom,
      expires_at: parsedSessionID.expiresAt,
      gas_price_limit: parsedSessionID.maxGasPrice,
      blockable: parsedSessionID.blockable,
      purgeable: parsedSessionID.purgeable,
      builder: parsedSessionID.builder,
      recurrency: parsedSessionID.recurrency,
      multisig: parsedSessionID.multisig,
      authEnabled: parsedSessionID.authEnabled,
    };
  }

  public getMessageHash(): string {
    return ethers.utils.hexlify(
      TypedDataUtils.eip712Hash(
        this.FCTData.typedData as unknown as TypedMessage<TypedDataTypes>,
        SignTypedDataVersion.V4
      )
    );
  }

  public isValid(softValidation = false): boolean | Error {
    const keys = Object.keys(this.FCTData);
    this.validateFCTKeys(keys);

    const limits = this.FCTData.typedData.message.limits;
    const fctData = this.FCTData.typedData.message.meta;

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

    return true;
  }

  public getSigners(): string[] {
    return this.FCTData.mcall.reduce((acc: string[], { from }) => {
      if (!acc.includes(from)) {
        acc.push(from);
      }
      return acc;
    }, []);
  }

  public getAllPaths(): string[][] {
    const FCT = this.FCTData;
    const g = new Graph({ directed: true });

    FCT.mcall.forEach((_, index) => {
      g.setNode(index.toString());
    });

    for (let i = 0; i < FCT.mcall.length - 1; i++) {
      //   const callID = parseCallID(fct.mcall[i].callId, true);
      const callID = CallID.parseWithNumbers(FCT.mcall[i].callId);
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

    const isVisited: Record<string, boolean> = {};
    const pathList: string[] = [];
    const start = "0";
    const end = (FCT.mcall.length - 1).toString();

    pathList.push(start);

    const printAllPathsUtil = (
      g: Graph,
      start: string,
      end: string,
      isVisited: Record<string, boolean>,
      localPathList: string[]
    ) => {
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
  }

  private validateFCTKeys(keys: string[]) {
    const validKeys = [
      "typeHash",
      "typedData",
      "sessionId",
      "nameHash",
      "mcall",
      "builder",
      "variables",
      "externalSigners",
      "computed",
      "signatures",
    ];
    validKeys.forEach((key) => {
      if (!keys.includes(key)) {
        throw new Error(`FCT missing key ${key}`);
      }
    });
  }
}
