import { SignTypedDataVersion, TypedDataUtils } from "@metamask/eth-sig-util";
export function getMessageHashFromTypedData(typedData) {
    const buffer = TypedDataUtils.eip712Hash(typedData, SignTypedDataVersion.V4);
    return ("0x" + buffer.toString("hex")).toLowerCase();
}
//# sourceMappingURL=eip712.js.map