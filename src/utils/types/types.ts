import { EIP1559GasPrice } from "../../types";

export interface TransactionValidatorSuccess {
  isValid: boolean;
  txData: { gas: number; type: 2 } & EIP1559GasPrice;
  prices: { gas: number; gasPrice: string };
  error: null;
  executionData?: {
    callsReturn: Record<string, string>[];
    callsData: Record<string, string>[];
  };
}

export interface TransactionValidatorError {
  isValid: boolean;
  txData: { gas: number; type: 2 } & EIP1559GasPrice;
  prices: { gas: number; gasPrice: string };
  error: string;
  executionData: {
    callsReturn: Record<string, string>[];
    callsData: Record<string, string>[];
  };
}

export type TransactionValidatorResult = TransactionValidatorSuccess | TransactionValidatorError;

export interface TransactionValidatorSuccessV2 {
  isValid: boolean;
  txData: { gas: number; type: 2 } & EIP1559GasPrice;
  prices: { gas: number; gasPrice: string };
  callData: string;
  error: null;
  executionData?: {
    callsReturn: Record<string, string>[];
    callsData: Record<string, string>[];
  };
}

export interface TransactionValidatorErrorV2 {
  isValid: boolean;
  txData: { gas: number; type: 2 } & EIP1559GasPrice;
  prices: { gas: number; gasPrice: string };
  callData: string;
  error: string;
  executionData: {
    callsReturn: Record<string, string>[];
    callsData: Record<string, string>[];
  };
}

export type TransactionValidatorResultV2 = TransactionValidatorSuccessV2 | TransactionValidatorErrorV2;
