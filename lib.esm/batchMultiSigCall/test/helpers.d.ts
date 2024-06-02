import { ChainId } from "@kiroboio/fct-plugins";
import { BatchMultiSigCall } from "../batchMultiSigCall";
export declare const TestFCT: {
    typedData: {
        types: {
            EIP712Domain: {
                name: string;
                type: string;
            }[];
            Meta: {
                name: string;
                type: string;
            }[];
            Limits: {
                name: string;
                type: string;
            }[];
            Recurrency: {
                name: string;
                type: string;
            }[];
            transaction1: {
                name: string;
                type: string;
            }[];
            BatchMultiSigCall: {
                name: string;
                type: string;
            }[];
            Call: {
                name: string;
                type: string;
            }[];
        };
        primaryType: string;
        domain: {
            name: string;
            version: string;
            chainId: number;
            verifyingContract: string;
            salt: string;
        };
        message: {
            meta: {
                name: string;
                builder: string;
                selector: string;
                version: string;
                random_id: string;
                eip712: boolean;
                auth_enabled: boolean;
            };
            limits: {
                valid_from: string;
                expires_at: string;
                gas_price_limit: string;
                purgeable: boolean;
                blockable: boolean;
            };
            recurrency: {
                max_repeats: string;
                chill_time: string;
                accumetable: boolean;
            };
            transaction_1: {
                call: {
                    call_index: number;
                    payer_index: number;
                    call_type: string;
                    from: string;
                    to: string;
                    to_ens: string;
                    eth_value: string;
                    gas_limit: string;
                    permissions: number;
                    flow_control: string;
                    returned_false_means_fail: boolean;
                    jump_on_success: number;
                    jump_on_fail: number;
                    method_interface: string;
                };
            };
        };
    };
    builder: string;
    typeHash: string;
    sessionId: string;
    nameHash: string;
    mcall: {
        typeHash: string;
        ensHash: string;
        functionSignature: string;
        value: string;
        callId: string;
        from: string;
        to: string;
        data: string;
        types: never[];
        typedHashes: never[];
    }[];
    variables: never[];
    externalSigners: never[];
    signatures: {
        r: string;
        s: string;
        _vs: string;
        recoveryParam: number;
        v: number;
        yParityAndS: string;
        compact: string;
    }[];
    computed: never[];
};
export declare const buildTestFCT: () => {
    FCT: BatchMultiSigCall;
    FCTJson: {
        typedData: {
            types: {
                EIP712Domain: {
                    name: string;
                    type: string;
                }[];
                Meta: {
                    name: string;
                    type: string;
                }[];
                Limits: {
                    name: string;
                    type: string;
                }[];
                Recurrency: {
                    name: string;
                    type: string;
                }[];
                transaction1: {
                    name: string;
                    type: string;
                }[];
                BatchMultiSigCall: {
                    name: string;
                    type: string;
                }[];
                Call: {
                    name: string;
                    type: string;
                }[];
            };
            primaryType: string;
            domain: {
                name: string;
                version: string;
                chainId: number;
                verifyingContract: string;
                salt: string;
            };
            message: {
                meta: {
                    name: string;
                    builder: string;
                    selector: string;
                    version: string;
                    random_id: string;
                    eip712: boolean;
                    auth_enabled: boolean;
                };
                limits: {
                    valid_from: string;
                    expires_at: string;
                    gas_price_limit: string;
                    purgeable: boolean;
                    blockable: boolean;
                };
                recurrency: {
                    max_repeats: string;
                    chill_time: string;
                    accumetable: boolean;
                };
                transaction_1: {
                    call: {
                        call_index: number;
                        payer_index: number;
                        call_type: string;
                        from: string;
                        to: string;
                        to_ens: string;
                        eth_value: string;
                        gas_limit: string;
                        permissions: number;
                        flow_control: string;
                        returned_false_means_fail: boolean;
                        jump_on_success: number;
                        jump_on_fail: number;
                        method_interface: string;
                    };
                };
            };
        };
        builder: string;
        typeHash: string;
        sessionId: string;
        nameHash: string;
        mcall: {
            typeHash: string;
            ensHash: string;
            functionSignature: string;
            value: string;
            callId: string;
            from: string;
            to: string;
            data: string;
            types: never[];
            typedHashes: never[];
        }[];
        variables: never[];
        externalSigners: never[];
        signatures: {
            r: string;
            s: string;
            _vs: string;
            recoveryParam: number;
            v: number;
            yParityAndS: string;
            compact: string;
        }[];
        computed: never[];
    };
};
export declare const freshTestFCT: ({ chainId }: {
    chainId: ChainId;
}) => BatchMultiSigCall;
//# sourceMappingURL=helpers.d.ts.map