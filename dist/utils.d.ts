import { SignatureLike } from "@ethersproject/bytes";
import { TypedData } from "ethers-eip712";
import { MSCall } from "./batchMultiSigCall/interfaces";
interface IFCTTypedData extends TypedData {
    message: {
        limits: {
            valid_from: string;
            expires_at: string;
            gas_price_limit: string;
            purgeable: boolean;
            cancelable: boolean;
        };
        fct: {
            eip712: boolean;
            builder: string;
        };
    };
}
interface IFCT {
    typedData: IFCTTypedData;
    signatures: {
        r: string;
        s: string;
        v: number;
    }[];
    mcall: MSCall[];
}
declare const _default: {
    getFCTMessageHash: (typedData: TypedData) => string;
    validateFCT: (FCT: IFCT) => {
        getOptions: () => {
            valid_from: string;
            expires_at: string;
            gas_price_limit: string;
            builder: string;
        };
        getSigners: () => string[];
    };
    recoverAddressFromEIP712: (typedData: TypedData, signature: SignatureLike) => string;
};
export default _default;
