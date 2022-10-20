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
    mcall: MSCall[];
}
interface ITxValidator {
    rpcUrl: string;
    callData: string;
    actuatorPrivateKey: string;
    actuatorContractAddress: string;
    activateForFree: boolean;
}
declare const _default: {
    getFCTMessageHash: (typedData: TypedData) => string;
    validateFCT: (FCT: IFCT, softValidation?: boolean) => {
        getOptions: () => {
            valid_from: string;
            expires_at: string;
            gas_price_limit: string;
            builder: string;
        };
        getFCTMessageHash: () => string;
        getSigners: () => string[];
    };
    recoverAddressFromEIP712: (typedData: TypedData, signature: SignatureLike) => string;
    getVariablesAsBytes32: (variables: string[]) => string[];
    transactionValidator: (transactionValidatorInterface: ITxValidator) => Promise<{
        isValid: boolean;
        gasUsed: string;
        error: any;
    }>;
};
export default _default;
