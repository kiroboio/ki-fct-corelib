import Web3 from "web3";
import Contract from "web3/eth/contract";
import { DecodeTx } from "../interfaces";
import { BatchMultiSigCallInputInterface, BatchMultiSigCallInterface, MultiSigCallInputInterface } from "./interfaces";
export declare class BatchMultiSigCall {
    calls: Array<BatchMultiSigCallInterface>;
    variables: Array<Array<string>>;
    web3: Web3;
    FactoryProxy: Contract;
    factoryProxyAddress: string;
    constructor(web3: Web3, contractAddress: string);
    createVariable(variableId: string, value?: string): string[];
    addVariableValue(variableId: string, value: string): string[];
    removeVariable(variableId: string): Promise<string[]>;
    getVariablesAsBytes32(): string[];
    private getVariableIndex;
    private getVariableFCValue;
    refTxValue(index: number, bytes?: boolean): string;
    addExistingBatchCall(batchCall: BatchMultiSigCallInterface): BatchMultiSigCallInterface[];
    addBatchCall(tx: BatchMultiSigCallInputInterface): Promise<{
        typedData: {
            types: {
                EIP712Domain: {
                    name: string;
                    type: string;
                }[];
                BatchMultiSigCall_: {
                    name: string;
                    type: string;
                }[];
                Limits_: {
                    name: string;
                    type: string;
                }[];
                Transaction_: {
                    name: string;
                    type: string;
                }[];
            };
            primaryType: string;
            domain: {
                name: any;
                version: any;
                chainId: number;
                verifyingContract: string;
                salt: any;
            };
            message: {
                limits: {
                    nonce: string;
                    refund: boolean;
                    valid_from: number;
                    expires_at: number;
                    gas_price_limit: number;
                };
            };
        };
        typeHash: string;
        sessionId: string;
        encodedMessage: string;
        encodedLimits: string;
        inputData: BatchMultiSigCallInputInterface;
        mcall: {
            encodedMessage: string;
            encodedDetails: string;
            typeHash: string;
            functionSignature: string;
            value: string;
            from: string;
            gasLimit: number;
            flags: string;
            to: string;
            ensHash: string;
            data: string;
            types: any[];
        }[];
    }>;
    addMultipleBatchCalls(txs: BatchMultiSigCallInputInterface[]): Promise<{
        typedData: {
            types: {
                EIP712Domain: {
                    name: string;
                    type: string;
                }[];
                BatchMultiSigCall_: {
                    name: string;
                    type: string;
                }[];
                Limits_: {
                    name: string;
                    type: string;
                }[];
                Transaction_: {
                    name: string;
                    type: string;
                }[];
            };
            primaryType: string;
            domain: {
                name: any;
                version: any;
                chainId: number;
                verifyingContract: string;
                salt: any;
            };
            message: {
                limits: {
                    nonce: string;
                    refund: boolean;
                    valid_from: number;
                    expires_at: number;
                    gas_price_limit: number;
                };
            };
        };
        typeHash: string;
        sessionId: string;
        encodedMessage: string;
        encodedLimits: string;
        inputData: BatchMultiSigCallInputInterface;
        mcall: {
            encodedMessage: string;
            encodedDetails: string;
            typeHash: string;
            functionSignature: string;
            value: string;
            from: string;
            gasLimit: number;
            flags: string;
            to: string;
            ensHash: string;
            data: string;
            types: any[];
        }[];
    }[]>;
    editBatchCall(index: number, tx: BatchMultiSigCallInputInterface): Promise<{
        typedData: {
            types: {
                EIP712Domain: {
                    name: string;
                    type: string;
                }[];
                BatchMultiSigCall_: {
                    name: string;
                    type: string;
                }[];
                Limits_: {
                    name: string;
                    type: string;
                }[];
                Transaction_: {
                    name: string;
                    type: string;
                }[];
            };
            primaryType: string;
            domain: {
                name: any;
                version: any;
                chainId: number;
                verifyingContract: string;
                salt: any;
            };
            message: {
                limits: {
                    nonce: string;
                    refund: boolean;
                    valid_from: number;
                    expires_at: number;
                    gas_price_limit: number;
                };
            };
        };
        typeHash: string;
        sessionId: string;
        encodedMessage: string;
        encodedLimits: string;
        inputData: BatchMultiSigCallInputInterface;
        mcall: {
            encodedMessage: string;
            encodedDetails: string;
            typeHash: string;
            functionSignature: string;
            value: string;
            from: string;
            gasLimit: number;
            flags: string;
            to: string;
            ensHash: string;
            data: string;
            types: any[];
        }[];
    }>;
    removeBatchCall(index: number): Promise<BatchMultiSigCallInterface[]>;
    addMultiCallTx(indexOfBatch: number, tx: MultiSigCallInputInterface): Promise<{
        typedData: {
            types: {
                EIP712Domain: {
                    name: string;
                    type: string;
                }[];
                BatchMultiSigCall_: {
                    name: string;
                    type: string;
                }[];
                Limits_: {
                    name: string;
                    type: string;
                }[];
                Transaction_: {
                    name: string;
                    type: string;
                }[];
            };
            primaryType: string;
            domain: {
                name: any;
                version: any;
                chainId: number;
                verifyingContract: string;
                salt: any;
            };
            message: {
                limits: {
                    nonce: string;
                    refund: boolean;
                    valid_from: number;
                    expires_at: number;
                    gas_price_limit: number;
                };
            };
        };
        typeHash: string;
        sessionId: string;
        encodedMessage: string;
        encodedLimits: string;
        inputData: BatchMultiSigCallInputInterface;
        mcall: {
            encodedMessage: string;
            encodedDetails: string;
            typeHash: string;
            functionSignature: string;
            value: string;
            from: string;
            gasLimit: number;
            flags: string;
            to: string;
            ensHash: string;
            data: string;
            types: any[];
        }[];
    }>;
    editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiSigCallInputInterface): Promise<{
        typedData: {
            types: {
                EIP712Domain: {
                    name: string;
                    type: string;
                }[];
                BatchMultiSigCall_: {
                    name: string;
                    type: string;
                }[];
                Limits_: {
                    name: string;
                    type: string;
                }[];
                Transaction_: {
                    name: string;
                    type: string;
                }[];
            };
            primaryType: string;
            domain: {
                name: any;
                version: any;
                chainId: number;
                verifyingContract: string;
                salt: any;
            };
            message: {
                limits: {
                    nonce: string;
                    refund: boolean;
                    valid_from: number;
                    expires_at: number;
                    gas_price_limit: number;
                };
            };
        };
        typeHash: string;
        sessionId: string;
        encodedMessage: string;
        encodedLimits: string;
        inputData: BatchMultiSigCallInputInterface;
        mcall: {
            encodedMessage: string;
            encodedDetails: string;
            typeHash: string;
            functionSignature: string;
            value: string;
            from: string;
            gasLimit: number;
            flags: string;
            to: string;
            ensHash: string;
            data: string;
            types: any[];
        }[];
    }>;
    removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number): Promise<{
        typedData: {
            types: {
                EIP712Domain: {
                    name: string;
                    type: string;
                }[];
                BatchMultiSigCall_: {
                    name: string;
                    type: string;
                }[];
                Limits_: {
                    name: string;
                    type: string;
                }[];
                Transaction_: {
                    name: string;
                    type: string;
                }[];
            };
            primaryType: string;
            domain: {
                name: any;
                version: any;
                chainId: number;
                verifyingContract: string;
                salt: any;
            };
            message: {
                limits: {
                    nonce: string;
                    refund: boolean;
                    valid_from: number;
                    expires_at: number;
                    gas_price_limit: number;
                };
            };
        };
        typeHash: string;
        sessionId: string;
        encodedMessage: string;
        encodedLimits: string;
        inputData: BatchMultiSigCallInputInterface;
        mcall: {
            encodedMessage: string;
            encodedDetails: string;
            typeHash: string;
            functionSignature: string;
            value: string;
            from: string;
            gasLimit: number;
            flags: string;
            to: string;
            ensHash: string;
            data: string;
            types: any[];
        }[];
    }>;
    private getMultiSigCallData;
    decodeLimits(encodedLimits: string): {
        nonce: any;
        payment: any;
        afterTimestamp: any;
        beforeTimestamp: any;
        maxGasPrice: any;
    };
    decodeTransactions(txs: DecodeTx[]): {
        typeHash: any;
        txHash: any;
        transaction: {
            signer: any;
            to: any;
            toEnsHash: any;
            value: any;
            gasLimit: any;
            staticCall: any;
            flow: any;
            jump: any;
            methodHash: any;
        };
    }[];
}
