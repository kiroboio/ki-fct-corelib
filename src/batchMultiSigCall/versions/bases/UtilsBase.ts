import { SignatureLike } from "@ethersproject/bytes";
import { ethers } from "ethers";

import { BatchMultiSigCall } from "../..";
import { IFCT } from "../../types";

export abstract class UtilsBase {
  public FCT: BatchMultiSigCall | undefined;
  constructor(FCT?: BatchMultiSigCall) {
    this.FCT = FCT;
  }

  abstract getBatchMultiSigCallABI(): ethers.utils.Interface;

  abstract getCalldataForActuator(data: {
    signatures: SignatureLike[];
    purgedFCT?: string;
    investor?: string;
    activator: string;
    externalSigners?: string[];
    variables?: string[];
  }): string;

  abstract getCalldataForActuatorWithSignedFCT(data: {
    signedFCT: IFCT;
    purgedFCT: string;
    investor: string;
    activator: string;
    version: string;
  }): string;
}
