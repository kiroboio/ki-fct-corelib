import { Interfaces } from "../../helpers/Interfaces";
export function getCalldataForActuator({ signedFCT, purgedFCT, investor, activator, version, }) {
    return Interfaces.FCT_BatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
        `0x${version}`.padEnd(66, "0"),
        signedFCT,
        purgedFCT,
        investor,
        activator,
    ]);
}
//# sourceMappingURL=getCalldataForActuator.js.map