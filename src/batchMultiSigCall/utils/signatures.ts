import { signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util";
import { splitSignature } from "ethers/lib/utils";

import { BatchMultiSigCallTypedData } from "../types";

const AUTHENTICATOR_PRIVATE_KEY = "5c35caeef2837c989ca02120f70b439b1f3266b779db6eb38ccabba24a2522b3";

export const getAuthenticatorSignature = (typedData: BatchMultiSigCallTypedData) => {
  const signature = signTypedData({
    data: typedData as any,
    privateKey: Buffer.from(AUTHENTICATOR_PRIVATE_KEY, "hex"),
    version: SignTypedDataVersion.V4,
  });

  return splitSignature(signature);
};
