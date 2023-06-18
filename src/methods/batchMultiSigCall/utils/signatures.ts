import { signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util";
import { ethers } from "ethers";

import { BatchMultiSigCallTypedData } from "../types";

const splitSignature = ethers.utils.splitSignature;
const AUTHENTICATOR_PRIVATE_KEY = "5c35caeef2837c989ca02120f70b439b1f3266b779db6eb38ccabba24a2522b3";

export const getAuthenticatorSignature = (typedData: BatchMultiSigCallTypedData) => {
  try {
    const signature = signTypedData({
      data: typedData as any,
      privateKey: Buffer.from(AUTHENTICATOR_PRIVATE_KEY, "hex"),
      version: SignTypedDataVersion.V4,
    });

    return splitSignature(signature);
  } catch (e) {
    return { r: "0x", s: "0x", v: 0 };
  }
};
