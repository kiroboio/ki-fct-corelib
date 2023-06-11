import { EIP1559GasPrice } from "../../types";

export interface TransactionValidatorSuccess {
  isValid: true;
  txData: { gas: number; type: 2 } & EIP1559GasPrice;
  prices: { gas: number; gasPrice: number };
  error: null;
}

export interface TransactionValidatorError {
  isValid: false;
  txData: { gas: number; type: 2 } & EIP1559GasPrice;
  prices: { gas: number; gasPrice: number };
  error: string;
}

export type TransactionValidatorResult = TransactionValidatorSuccess | TransactionValidatorError;
