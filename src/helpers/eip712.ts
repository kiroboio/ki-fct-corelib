import { SignTypedDataVersion, TypedDataUtils, TypedMessage } from "@metamask/eth-sig-util";
import { ethers } from "ethers";

import { IFCT, TypedDataTypes } from "../types";

export function getMessageHashFromTypedData(typedData: IFCT["typedData"]): string {
  return ethers.utils.hexlify(
    TypedDataUtils.eip712Hash(typedData as unknown as TypedMessage<TypedDataTypes>, SignTypedDataVersion.V4),
  );
}
