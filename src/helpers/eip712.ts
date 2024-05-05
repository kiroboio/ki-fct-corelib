import { SignTypedDataVersion, TypedDataUtils, TypedMessage } from "@metamask/eth-sig-util";

import { IFCT, TypedDataTypes } from "../types";

export function getMessageHashFromTypedData(typedData: IFCT["typedData"]): string {
  const buffer = TypedDataUtils.eip712Hash(
    typedData as unknown as TypedMessage<TypedDataTypes>,
    SignTypedDataVersion.V4,
  );
  return ("0x" + buffer.toString("hex")).toLowerCase();
}
