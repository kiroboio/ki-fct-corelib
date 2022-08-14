import { ethers } from "ethers";
import { DecodeTx } from "../interfaces";
import { BatchMSCallInput, BatchMSCall, MSCallInput } from "./interfaces";
export declare class BatchMultiSigCall {
    calls: Array<BatchMSCall>;
    variables: Array<Array<string>>;
    provider: ethers.providers.JsonRpcProvider;
    FactoryProxy: ethers.Contract;
    factoryProxyAddress: string;
    constructor(provider: ethers.providers.JsonRpcProvider, contractAddress: string);
    createVariable(variableId: string, value?: string): string[];
    addVariableValue(variableId: string, value: string): string[];
    removeVariable(variableId: string): Promise<string[]>;
    getVariablesAsBytes32(): string[];
    private getVariableIndex;
    private getVariableFCValue;
    refTxValue(index: number, bytes?: boolean): string;
    addExistingBatchCall(batchCall: BatchMSCall): BatchMSCall[];
    create(tx: BatchMSCallInput): Promise<{
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
                chainId: any;
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
        inputData: BatchMSCallInput;
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
            types: any;
            typedHashes: any[];
        }[];
        addCall: (tx: MSCallInput, index?: number) => Promise<any>;
        replaceCall: (tx: MSCallInput, index: number) => Promise<any>;
        removeCall: (index: number) => Promise<any>;
        getCall: (index: number) => any;
        readonly length: any;
    }>;
    createMultiple(txs: BatchMSCallInput[]): Promise<{
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
                chainId: any;
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
        inputData: BatchMSCallInput;
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
            types: any;
            typedHashes: any[];
        }[];
        addCall: (tx: MSCallInput, index?: number) => Promise<any>;
        replaceCall: (tx: MSCallInput, index: number) => Promise<any>;
        removeCall: (index: number) => Promise<any>;
        getCall: (index: number) => any;
        readonly length: any;
    }[]>;
    editBatchCall(index: number, tx: BatchMSCallInput): Promise<{
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
                chainId: any;
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
        inputData: BatchMSCallInput;
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
            types: any;
            typedHashes: any[];
        }[];
        addCall: (tx: MSCallInput, index?: number) => Promise<any>;
        replaceCall: (tx: MSCallInput, index: number) => Promise<any>;
        removeCall: (index: number) => Promise<any>;
        getCall: (index: number) => any;
        readonly length: any;
    }>;
    removeBatchCall(index: number): Promise<BatchMSCall[]>;
    addMultiCallTx(indexOfBatch: number, tx: MSCallInput): Promise<{
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
                chainId: any;
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
        inputData: BatchMSCallInput;
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
            types: any;
            typedHashes: any[];
        }[];
        addCall: (tx: MSCallInput, index?: number) => Promise<any>;
        replaceCall: (tx: MSCallInput, index: number) => Promise<any>;
        removeCall: (index: number) => Promise<any>;
        getCall: (index: number) => any;
        readonly length: any;
    }>;
    editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MSCallInput): Promise<{
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
                chainId: any;
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
        inputData: BatchMSCallInput;
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
            types: any;
            typedHashes: any[];
        }[];
        addCall: (tx: MSCallInput, index?: number) => Promise<any>;
        replaceCall: (tx: MSCallInput, index: number) => Promise<any>;
        removeCall: (index: number) => Promise<any>;
        getCall: (index: number) => any;
        readonly length: any;
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
                chainId: any;
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
        inputData: BatchMSCallInput;
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
            types: any;
            typedHashes: any[];
        }[];
        addCall: (tx: MSCallInput, index?: number) => Promise<any>;
        replaceCall: (tx: MSCallInput, index: number) => Promise<any>;
        removeCall: (index: number) => Promise<any>;
        getCall: (index: number) => any;
        readonly length: any;
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
