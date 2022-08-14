import { ethers } from "ethers";
import { DecodeTx } from "../interfaces";
import { BatchMultiSigCallInputInterface, BatchMultiSigCallInterface, MultiSigCallInputInterface } from "./interfaces";
export declare class BatchMultiSigCallNew {
    calls: Array<BatchMultiSigCallInterface>;
    variables: Array<Array<string>>;
    provider: ethers.providers.JsonRpcProvider;
    FactoryProxy: ethers.Contract;
    factoryProxyAddress: string;
    constructor(provider: ethers.providers.JsonRpcProvider, contractAddress: string);
    createVariable(variableId: string, value?: string): string[];
    addVariableValue(variableId: string, value: string): string[];
    removeVariable(variableId: string): Promise<string[]>;
    getVariablesAsBytes32(): string[];
    getVariableIndex(variableId: string, throwError?: boolean): number;
    getVariableFCValue(variableId: string): string;
    refTxValue(index: number, bytes?: boolean): string;
    addExistingBatchCall(batchCall: BatchMultiSigCallInterface): BatchMultiSigCallInterface[];
    create(tx: BatchMultiSigCallInputInterface): Promise<{
        typedData: {
            types: {
                Transaction: {
                    name: string;
                    type: string;
                }[];
                EIP712Domain: {
                    name: string;
                    type: string;
                }[];
                BatchMultiSigCall: {
                    name: string;
                    type: string;
                }[];
                Info: {
                    name: string;
                    type: string;
                }[];
                Limits: {
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
                info: {
                    name: string;
                    version: number;
                    random_id: number;
                    eip712: boolean;
                };
                limits: {
                    valid_from: number;
                    expires_at: number;
                    gas_price_limit: number;
                    cancelable: true;
                };
            };
        };
        typeHash: string;
        sessionId: string;
        inputData: BatchMultiSigCallInputInterface;
        mcall: {
            typeHash: string;
            functionSignature: string;
            value: string;
            from: string;
            gasLimit: number;
            flags: string;
            to: any;
            ensHash: string;
            data: string;
            types: any;
            typedHashes: any[];
        }[];
        addCall: (tx: BatchMultiSigCallInterface, index?: number) => Promise<void>;
        replaceCall: (tx: BatchMultiSigCallInterface, index: number) => Promise<any>;
        removeCall: (index: number) => Promise<any>;
        getCall: (index: number) => any;
        readonly length: any;
    }>;
    createMultiple(txs: BatchMultiSigCallInputInterface[]): Promise<{
        typedData: {
            types: {
                Transaction: {
                    name: string;
                    type: string;
                }[];
                EIP712Domain: {
                    name: string;
                    type: string;
                }[];
                BatchMultiSigCall: {
                    name: string;
                    type: string;
                }[];
                Info: {
                    name: string;
                    type: string;
                }[];
                Limits: {
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
                info: {
                    name: string;
                    version: number;
                    random_id: number;
                    eip712: boolean;
                };
                limits: {
                    valid_from: number;
                    expires_at: number;
                    gas_price_limit: number;
                    cancelable: true;
                };
            };
        };
        typeHash: string;
        sessionId: string;
        inputData: BatchMultiSigCallInputInterface;
        mcall: {
            typeHash: string;
            functionSignature: string;
            value: string;
            from: string;
            gasLimit: number;
            flags: string;
            to: any;
            ensHash: string;
            data: string;
            types: any;
            typedHashes: any[];
        }[];
        addCall: (tx: BatchMultiSigCallInterface, index?: number) => Promise<void>;
        replaceCall: (tx: BatchMultiSigCallInterface, index: number) => Promise<any>;
        removeCall: (index: number) => Promise<any>;
        getCall: (index: number) => any;
        readonly length: any;
    }[]>;
    editBatchCall(index: number, tx: BatchMultiSigCallInputInterface): Promise<{
        typedData: {
            types: {
                Transaction: {
                    name: string;
                    type: string;
                }[];
                EIP712Domain: {
                    name: string;
                    type: string;
                }[];
                BatchMultiSigCall: {
                    name: string;
                    type: string;
                }[];
                Info: {
                    name: string;
                    type: string;
                }[];
                Limits: {
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
                info: {
                    name: string;
                    version: number;
                    random_id: number;
                    eip712: boolean;
                };
                limits: {
                    valid_from: number;
                    expires_at: number;
                    gas_price_limit: number;
                    cancelable: true;
                };
            };
        };
        typeHash: string;
        sessionId: string;
        inputData: BatchMultiSigCallInputInterface;
        mcall: {
            typeHash: string;
            functionSignature: string;
            value: string;
            from: string;
            gasLimit: number;
            flags: string;
            to: any;
            ensHash: string;
            data: string;
            types: any;
            typedHashes: any[];
        }[];
        addCall: (tx: BatchMultiSigCallInterface, index?: number) => Promise<void>;
        replaceCall: (tx: BatchMultiSigCallInterface, index: number) => Promise<any>;
        removeCall: (index: number) => Promise<any>;
        getCall: (index: number) => any;
        readonly length: any;
    }>;
    removeBatchCall(index: number): Promise<BatchMultiSigCallInterface[]>;
    addMultiCallTx(indexOfBatch: number, tx: MultiSigCallInputInterface): Promise<{
        typedData: {
            types: {
                Transaction: {
                    name: string;
                    type: string;
                }[];
                EIP712Domain: {
                    name: string;
                    type: string;
                }[];
                BatchMultiSigCall: {
                    name: string;
                    type: string;
                }[];
                Info: {
                    name: string;
                    type: string;
                }[];
                Limits: {
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
                info: {
                    name: string;
                    version: number;
                    random_id: number;
                    eip712: boolean;
                };
                limits: {
                    valid_from: number;
                    expires_at: number;
                    gas_price_limit: number;
                    cancelable: true;
                };
            };
        };
        typeHash: string;
        sessionId: string;
        inputData: BatchMultiSigCallInputInterface;
        mcall: {
            typeHash: string;
            functionSignature: string;
            value: string;
            from: string;
            gasLimit: number;
            flags: string;
            to: any;
            ensHash: string;
            data: string;
            types: any;
            typedHashes: any[];
        }[];
        addCall: (tx: BatchMultiSigCallInterface, index?: number) => Promise<void>;
        replaceCall: (tx: BatchMultiSigCallInterface, index: number) => Promise<any>;
        removeCall: (index: number) => Promise<any>;
        getCall: (index: number) => any;
        readonly length: any;
    }>;
    editMultiCallTx(indexOfBatch: number, indexOfMulticall: number, tx: MultiSigCallInputInterface): Promise<{
        typedData: {
            types: {
                Transaction: {
                    name: string;
                    type: string;
                }[];
                EIP712Domain: {
                    name: string;
                    type: string;
                }[];
                BatchMultiSigCall: {
                    name: string;
                    type: string;
                }[];
                Info: {
                    name: string;
                    type: string;
                }[];
                Limits: {
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
                info: {
                    name: string;
                    version: number;
                    random_id: number;
                    eip712: boolean;
                };
                limits: {
                    valid_from: number;
                    expires_at: number;
                    gas_price_limit: number;
                    cancelable: true;
                };
            };
        };
        typeHash: string;
        sessionId: string;
        inputData: BatchMultiSigCallInputInterface;
        mcall: {
            typeHash: string;
            functionSignature: string;
            value: string;
            from: string;
            gasLimit: number;
            flags: string;
            to: any;
            ensHash: string;
            data: string;
            types: any;
            typedHashes: any[];
        }[];
        addCall: (tx: BatchMultiSigCallInterface, index?: number) => Promise<void>;
        replaceCall: (tx: BatchMultiSigCallInterface, index: number) => Promise<any>;
        removeCall: (index: number) => Promise<any>;
        getCall: (index: number) => any;
        readonly length: any;
    }>;
    removeMultiCallTx(indexOfBatch: number, indexOfMulticall: number): Promise<{
        typedData: {
            types: {
                Transaction: {
                    name: string;
                    type: string;
                }[];
                EIP712Domain: {
                    name: string;
                    type: string;
                }[];
                BatchMultiSigCall: {
                    name: string;
                    type: string;
                }[];
                Info: {
                    name: string;
                    type: string;
                }[];
                Limits: {
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
                info: {
                    name: string;
                    version: number;
                    random_id: number;
                    eip712: boolean;
                };
                limits: {
                    valid_from: number;
                    expires_at: number;
                    gas_price_limit: number;
                    cancelable: true;
                };
            };
        };
        typeHash: string;
        sessionId: string;
        inputData: BatchMultiSigCallInputInterface;
        mcall: {
            typeHash: string;
            functionSignature: string;
            value: string;
            from: string;
            gasLimit: number;
            flags: string;
            to: any;
            ensHash: string;
            data: string;
            types: any;
            typedHashes: any[];
        }[];
        addCall: (tx: BatchMultiSigCallInterface, index?: number) => Promise<void>;
        replaceCall: (tx: BatchMultiSigCallInterface, index: number) => Promise<any>;
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
