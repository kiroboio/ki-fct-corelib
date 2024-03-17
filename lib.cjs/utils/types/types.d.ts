import { EIP1559GasPrice } from "../../types";
export interface TransactionValidatorSuccess {
    isValid: true;
    txData: {
        gas: number;
        type: 2;
    } & EIP1559GasPrice;
    prices: {
        gas: number;
        gasPrice: string;
    };
    error: null;
}
export interface TransactionValidatorError {
    isValid: false;
    txData: {
        gas: number;
        type: 2;
    } & EIP1559GasPrice;
    prices: {
        gas: number;
        gasPrice: string;
    };
    error: string;
}
export type TransactionValidatorResult = TransactionValidatorSuccess | TransactionValidatorError;
//# sourceMappingURL=types.d.ts.map