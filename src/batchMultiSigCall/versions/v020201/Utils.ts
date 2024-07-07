import { SignatureLike } from "@ethersproject/bytes";
import { ethers } from "ethers";

import { deepMerge } from "../../../helpers";
import { UtilsBase } from "../bases/UtilsBase";
import BatchMultiSigCallABI_020201 from "./abis/FCT_BatchMultiSigCall.abi.json";

const IBatchMultiSigCall = new ethers.utils.Interface(BatchMultiSigCallABI_020201);

export class Utils_020201 extends UtilsBase {
  getCalldataForActuator({
    signatures,
    purgedFCT,
    investor,
    activator,
    externalSigners,
    variables,
  }: {
    signatures: SignatureLike[];
    purgedFCT: string;
    investor: string;
    activator: string;
    externalSigners: string[];
    variables: string[];
  }): string {
    if (!this.FCT) {
      throw new Error("FCT not found, should not be the case");
    }

    const signedFCT = deepMerge(this.FCT.export(), { signatures, externalSigners, variables });

    return IBatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
      this.FCT.version.padEnd(66, "0"),
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
