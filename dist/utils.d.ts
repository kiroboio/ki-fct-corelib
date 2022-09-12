import { TypedData } from "ethers-eip712";
interface IFCTTypedData extends TypedData {
    fct: {
        eip712: boolean;
    };
    message: {
        limits: {
            valid_from: string;
            expires_at: string;
            gas_price_limit: string;
            purgeable: boolean;
            cancelable: boolean;
        };
    };
}
declare const _default: {
    getFCTMessageHash: (typedData: TypedData) => string;
    validateFCT: (typedData: IFCTTypedData) => boolean;
};
export default _default;
