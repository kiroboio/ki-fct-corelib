import { ethers } from "ethers";

import { IFCT } from "../..";
import FCT020201ABI from "../../abi/020201/FCT_BatchMultiSigCall.abi.json";
import FCTABI from "../../abi/FCT_BatchMultiSigCall.abi.json";

const IFCTBatch = new ethers.utils.Interface(FCTABI);
const IFCTBatch020201 = new ethers.utils.Interface(FCT020201ABI);

export function getCalldataForActuator({
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
  if (version === "020201" || !version) {
    return IFCTBatch020201.encodeFunctionData("batchMultiSigCall", [
      `0x${version}`.padEnd(66, "0"),
      signedFCT,
      purgedFCT,
      investor,
      activator,
    ]);
  } else {
    return IFCTBatch.encodeFunctionData("batchMultiSigCall", [
      `0x${version}`.padEnd(66, "0"),
      signedFCT,
      purgedFCT,
      investor,
      activator,
    ]);
  }
}
