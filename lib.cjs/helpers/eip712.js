"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageHashFromTypedData = void 0;
const eth_sig_util_1 = require("@metamask/eth-sig-util");
function getMessageHashFromTypedData(typedData) {
    const buffer = eth_sig_util_1.TypedDataUtils.eip712Hash(typedData, eth_sig_util_1.SignTypedDataVersion.V4);
    return ("0x" + buffer.toString("hex")).toLowerCase();
}
exports.getMessageHashFromTypedData = getMessageHashFromTypedData;
//# sourceMappingURL=eip712.js.map