import { signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util";
import { ethers } from "ethers";
const AUTHENTICATOR_PRIVATE_KEY = "5c35caeef2837c989ca02120f70b439b1f3266b779db6eb38ccabba24a2522b3";
export const getAuthenticatorSignature = (typedData) => {
    try {
        const signature = signTypedData({
            data: typedData,
            privateKey: Buffer.from(AUTHENTICATOR_PRIVATE_KEY, "hex"),
            version: SignTypedDataVersion.V4,
        });
        return ethers.utils.splitSignature(signature);
    }
    catch (e) {
        throw new Error("Error signing typed data");
    }
};
//# sourceMappingURL=signatures.js.map