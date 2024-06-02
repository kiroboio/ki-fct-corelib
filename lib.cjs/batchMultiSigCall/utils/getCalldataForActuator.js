"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalldataForActuator = void 0;
const Interfaces_1 = require("../../helpers/Interfaces");
function getCalldataForActuator({ signedFCT, purgedFCT, investor, activator, version, }) {
    return Interfaces_1.Interfaces.FCT_BatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
        `0x${version}`.padEnd(66, "0"),
        signedFCT,
        purgedFCT,
        investor,
        activator,
    ]);
}
exports.getCalldataForActuator = getCalldataForActuator;
//# sourceMappingURL=getCalldataForActuator.js.map