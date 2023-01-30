import { utils } from "ethers";

import FCTBatchMultiSigCallABI from "../../abi/FCT_BatchMultiSigCall.abi.json";

export function getCalldataForActuator({
  signedFCT,
  purgedFCT,
  investor,
  activator,
  version,
}: {
  signedFCT: object;
  purgedFCT: string;
  investor: string;
  activator: string;
  version: string;
}): string {
  const FCT_BatchMultiSigCall = new utils.Interface(FCTBatchMultiSigCallABI);
  return FCT_BatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
    `0x${version}`.padEnd(66, "0"),
    signedFCT,
    purgedFCT,
    investor,
    activator,
  ]);
}
