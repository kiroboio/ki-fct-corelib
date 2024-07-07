import { SignatureLike } from "@ethersproject/bytes";
import { ethers } from "ethers";

import { deepMerge } from "../../../helpers";
import { IFCT } from "../../types";
import { UtilsBase } from "../bases/UtilsBase";
import BatchMultiSigCallABI from "./abis/FCT_BatchMultiSigCall.abi.json";

const IBatchMultiSigCall = new ethers.utils.Interface(BatchMultiSigCallABI);

export class Utils_oldVersion extends UtilsBase {
  getCalldataForActuator({
    signatures,
    purgedFCT = ethers.constants.HashZero,
    investor = ethers.constants.AddressZero,
    activator,
    externalSigners = [],
    variables = [],
  }: {
    signatures: SignatureLike[];
    purgedFCT?: string;
    investor?: string;
    activator: string;
    externalSigners?: string[];
    variables?: string[];
  }): string {
    if (!this.FCT) {
      throw new Error("FCT not found, should not be the case");
    }

    const signedFCT = deepMerge(this.FCT?.export(), { signatures, externalSigners, variables });

    return this.getCalldataForActuatorWithSignedFCT({
      signedFCT,
      purgedFCT,
      investor,
      activator,
      version: this.FCT.version,
    });
  }

  getCalldataForActuatorWithSignedFCT({
    signedFCT,
    purgedFCT,
    investor,
    activator,
    version,
  }: {
    signedFCT: IFCT;
    purgedFCT: string;
    investor: string;
    activator: string;
    version: string;
  }): string {
    version = version.startsWith("0x") ? version : `0x${version}`;
    return IBatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
      version.padEnd(66, "0"),
      signedFCT,
      purgedFCT,
      investor,
      activator,
    ]);
  }

  getBatchMultiSigCallABI(): ethers.utils.Interface {
    return IBatchMultiSigCall;
  }
}
