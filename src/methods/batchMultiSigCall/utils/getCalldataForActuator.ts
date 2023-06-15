import { Interfaces } from "../../../helpers/Interfaces";
import { IBatchMultiSigCallFCT } from "../types";

export function getCalldataForActuator({
  signedFCT,
  purgedFCT,
  investor,
  activator,
  version,
}: {
  signedFCT: IBatchMultiSigCallFCT;
  purgedFCT: string;
  investor: string;
  activator: string;
  version: string;
}): string {
  return Interfaces.FCT_BatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
    `0x${version}`.padEnd(66, "0"),
    signedFCT,
    purgedFCT,
    investor,
    activator,
  ]);
}
