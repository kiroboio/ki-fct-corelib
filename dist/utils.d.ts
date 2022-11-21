import { SignatureLike } from "@ethersproject/bytes";
import { BatchMultiSigCallTypedData, MSCall } from "./batchMultiSigCall/interfaces";
interface IFCT {
    typedData: BatchMultiSigCallTypedData;
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
    getFCTMessageHash: (typedData: BatchMultiSigCallTypedData) => string;
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
    recoverAddressFromEIP712: (typedData: BatchMultiSigCallTypedData, signature: SignatureLike) => string;
    getVariablesAsBytes32: (variables: string[]) => string[];
    transactionValidator: (transactionValidatorInterface: ITxValidator, pureGas?: boolean) => Promise<{
        isValid: boolean;
        gasUsed: number;
        gasPrice: number;
        error: any;
    }>;
};
export default _default;
