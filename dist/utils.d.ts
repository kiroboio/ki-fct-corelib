import { TypedData } from "ethers-eip712";
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
        };
    };
}
declare const _default: {
    getFCTMessageHash: (typedData: TypedData) => string;
    validateFCT: (typedData: IFCTTypedData) => boolean;
};
export default _default;
