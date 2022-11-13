import { SignatureLike } from "@ethersproject/bytes";
import { BigNumber } from "ethers";
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
    transactionValidator: (transactionValidatorInterface: ITxValidator) => Promise<{
        isValid: boolean;
        gasUsed: number;
        error: any;
    }>;
    feeCalculator: (transactionValidatorInterface: ITxValidator) => Promise<{
        fee: BigNumber;
        limit: string;
        maxFeePerGas: string;
        maxPriorityFeePerGas: string;
    }>;
};
export default _default;
