import { EIP1559GasPrice } from "../../types";

export interface TxValidatorExecutionData {
  callsReturn: { status: number; values: string }[];
  callsData: {
    target: string;
    ensHash: string;
    value: string;
    sessionId: string;
    callId: string;
    data: string;
  }[];
}

export interface TransactionValidatorSuccess {
  isValid: boolean;
  txData: { gas: number; type: 2 } & EIP1559GasPrice;
  prices: { gas: number; gasPrice: string };
  error: null;
  executionData?: TxValidatorExecutionData;
}

export interface TransactionValidatorError {
  isValid: boolean;
  txData: { gas: number; type: 2 } & EIP1559GasPrice;
  prices: { gas: number; gasPrice: string };
  error: string;
  executionData: TxValidatorExecutionData;
}

export type TransactionValidatorResult = TransactionValidatorSuccess | TransactionValidatorError;

export interface TransactionValidatorSuccessV2 {
  isValid: boolean;
  txData: { gas: number; type: 2 } & EIP1559GasPrice;
  prices: { gas: number; gasPrice: string };
  callData: string;
  error: null;
  executionData?: TxValidatorExecutionData;
}

export interface TransactionValidatorErrorV2 {
  isValid: boolean;
  txData: { gas: number; type: 2 } & EIP1559GasPrice;
  prices: { gas: number; gasPrice: string };
  callData: string;
  error: string;
  executionData: TxValidatorExecutionData;
}

export type TransactionValidatorResultV2 = TransactionValidatorSuccessV2 | TransactionValidatorErrorV2;
