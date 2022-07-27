// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import "./FCT_Storage.sol";
import "./interfaces/IFCT_BatchMultiSig.sol";
import "./interfaces/IFCT_Runner.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "hardhat/console.sol";

// 1-15     16bit flags
uint256 constant GAS_PRICE_LIMIT_BIT = 16; // 16-70    64bit gas price limit
uint256 constant GAS_LIMIT_BIT = 80; // 80-111   32bit gas limit
uint256 constant BEFORE_TS_BIT = 112; // 112-151  40bit before timestamp
uint256 constant AFTER_TS_BIT = 152; // 152-191  40bit after timestamp
uint256 constant NONCE_BIT = 192; // 192-231  40bit nonce
uint256 constant MAX_NONCE_JUMP_BIT = 216; // 216      24bit of nonce
uint256 constant GROUP_BIT = 232; // 232-255  24bit group

uint256 constant VAR_MIN = 0x00FC00000000000000000000000000000000000000;
uint256 constant VAR_MAX = 0x00FC00000000000000000000000000000000000100;
uint256 constant VARX_MIN = 0xFC00000000000000000000000000000000000000000000000000000000000000;
uint256 constant VARX_MAX = 0xFC00000000000000000000000000000000000000000000000000000000000100;
uint256 constant RET_MIN = 0x00FD00000000000000000000000000000000000000;
uint256 constant RET_MAX = 0x00FD00000000000000000000000000000000010000;
uint256 constant RETX_MIN = 0xFD00000000000000000000000000000000000000000000000000000000000000;
uint256 constant RETX_MAX = 0xFD00000000000000000000000000000000000000000000000000000000010000;
uint256 constant VAR_MASK = 0x0000000000000000000000000000000000000000ff;
uint256 constant RET_MASK = 0x00000000000000000000000000000000000000ff00;

struct PackedMSCall {
    uint256 value;
    // address signer;
    address from;
    uint32 gasLimit;
    uint16 flags;
    address to;
    bytes data;
}

struct PackedMSCalls {
    uint256 sessionId;
    PackedMSCall[] mcall;
    Signature[] signatures;
}

struct MultiSigCallLocals {
    bytes32 messageHash;
    uint256 constGas;
    uint256 gas;
    uint256 index;
    uint256 sessionId;
    uint256 trxCounter;
    MReturn[][] rt;
    bytes[] returnedValues;
}

struct MultiSigInternalCallLocals {
    address callFrom;
    address callTo;
    uint256 value;
    uint256 dataIndex;
    uint256 varId;
    bytes32 varValue;
    bytes data;
}

contract FCT_BatchMultiSig is FCT_Storage {
    // Stubs: Taken from FactoryProxy
    uint8 public constant VERSION_NUMBER = 0x0;
    string public constant NAME = "";
    string public constant VERSION = "";

    function uid() external pure returns (bytes32) {
        return 0x00;
    }

    function activator() external pure returns (address) {
        return address(0);
    }

    bytes32 public constant BATCH_MULTI_SIG_CALL_TYPEHASH_ =
        keccak256(
            "BatchMultiSigCall_(Limits limits,Transaction transaction)Limits_(uint256 sessionId)Transaction_(address from,address to,uint256 value,uint32 gasLimit,uint16 flags,bytes data)"
        );

    bytes32 public constant PACKED_BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH_ =
        keccak256("Limits_(uint256 sessionId)");

    bytes32 public constant PACKED_BATCH_MULTI_SIG_CALL_TRANSACTION_TYPEHASH_ =
        keccak256(
            "Transaction_(address from,address to,uint256 value,uint32 gasLimit,uint16 flags,bytes data)"
        );

    bytes32 public constant BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH_ =
        keccak256(
            "Limits_(uint64 nonce,bool refund,uint40 valid_from,uint40 expires_at,uint64 gas_price_limit)"
        );

    bytes32 public constant BATCH_MULTI_SIG_CALL_TRANSACTION_TYPEHASH_ =
        keccak256(
            "Transaction_(address from,address call_address,string call_ens,uint256 eth_value,uint32 gas_limit,bool view_only,string flow_control,uint8 jump_over,string method_interface)"
        );

    bytes32 public constant BATCH_MULTI_SIG_CALL_APPROVAL_TYPEHASH_ =
        keccak256("Approval_(address signer)");

    event BatchMultiSigCallFailed_(
        address indexed wallet,
        uint256 nonce,
        uint256 index,
        uint256 innerIndex
    );
    event BatchMultiSigCallPackedFailed_(
        address indexed wallet,
        uint256 nonce,
        uint256 index,
        uint256 innerIndex
    );
    event BatchTransfered_(uint256 indexed mode, uint256 block, uint256 nonce);

    constructor() {}

    function setActivator_(address newActivator) external onlyOwner {
        s_activator = newActivator;
    }

    function setLocalEns_(string calldata ens, address dest)
        external
        onlyOwner
    {
        s_local_ens[keccak256(abi.encodePacked("@", ens))] = dest;
    }

    function _executeCall(
        address wallet,
        address to,
        uint16 flags,
        uint32 gasLimit,
        bytes32 messageHash,
        bytes32 functionSignature,
        uint256 value,
        bool packed,
        bytes memory data
    ) private returns (bool, bytes memory) {
        if (flags & FLAG_CANCELABLE != 0) {
            messageHash = bytes32(0);
        }

        // assembly {
        //     let addr := mload(add(data.offset, 0x0))
        //     if lt(addr, 0x100) {
        //         mstore(add(data.offset, 0x0), mload(add(addresses, addr)))
        //     }
        // }

        return
            flags & FLAG_STATICCALL != 0
                ? wallet.call{
                    gas: gasLimit == 0 || gasLimit > gasleft()
                        ? gasleft()
                        : gasLimit
                }(
                    abi.encodeWithSignature(
                        "LocalStaticCall_(address,bytes,bytes32)",
                        to,
                        packed
                            ? data
                            : functionSignature ==
                                0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
                            ? bytes("")
                            : abi.encodePacked(bytes4(functionSignature), data),
                        messageHash
                    )
                )
                : wallet.call{
                    gas: gasLimit == 0 || gasLimit > gasleft()
                        ? gasleft()
                        : gasLimit
                }(
                    abi.encodeWithSignature(
                        "LocalCall_(address,uint256,bytes,bytes32)",
                        to,
                        value,
                        packed
                            ? data
                            : functionSignature ==
                                0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
                            ? bytes("")
                            : packed
                            ? data
                            : abi.encodePacked(bytes4(functionSignature), data),
                        messageHash
                    )
                );
    }

    function _executeCall(
        address wallet,
        address to,
        uint16 flags,
        uint32 gasLimit,
        bytes32 messageHash,
        bytes32 functionSignature,
        uint256 value,
        bytes memory data
    ) private returns (bool, bytes memory) {
        return
            _executeCall(
                wallet,
                to,
                flags,
                gasLimit,
                messageHash,
                functionSignature,
                value,
                false,
                data
            );
    }

    function _executePackedCall(
        address wallet,
        address to,
        uint16 flags,
        uint32 gasLimit,
        bytes32 messageHash,
        uint256 value,
        bytes calldata data
    ) private returns (bool, bytes memory) {
        return
            _executeCall(
                wallet,
                to,
                flags,
                gasLimit,
                messageHash,
                bytes32(0),
                value,
                true,
                data
            );
    }

    // Batch Call: Multi Signature, Multi External Contract Functions
    function batchMultiSigCall_(
        MSCalls[] calldata tr,
        bytes32[] calldata variables
    ) external returns (MReturn[][] memory rt) {
        // uint256 startGas = gasleft();
        require(msg.sender == s_activator, "Wallet: sender not allowed");
        rt = new MReturn[][](tr.length);
        unchecked {
            uint256 trLength = tr.length;
            uint256 constGas = (21000 + msg.data.length * 8) / trLength;
            //console.log("gas until i:",startGas- gasleft() );
            bytes32[] calldata variables_ = variables;
            for (uint256 i = 0; i < trLength; ++i) {
                uint256 IGas = gasleft();
                MSCalls calldata mcalls = tr[i];
                // console.log("proxy: i: ", i);
                uint256 sessionId = mcalls.sessionId;
                bytes memory msg2 = abi.encode(
                    mcalls.typeHash,
                    keccak256(
                        abi.encode(
                            BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH_,
                            uint64(sessionId >> NONCE_BIT), // group + nonce
                            sessionId & FLAG_PAYMENT != 0,
                            uint40(sessionId >> AFTER_TS_BIT),
                            uint40(sessionId >> BEFORE_TS_BIT),
                            uint64(sessionId >> GAS_PRICE_LIMIT_BIT)
                        )
                    )
                );

                // _checkSessionIdLimits(i, sessionId, nonce, maxNonce);
                _checkSessionIdLimits(sessionId);
                // maxNonce = sessionId;

                uint256 length = mcalls.mcall.length;
                for (uint256 j = 0; j < length; ++j) {
                    MSCall calldata call = mcalls.mcall[j];
                    // console.log(
                    //     "proxy start: call.to %s, call.value %s",
                    //     call.to,
                    //     call.value
                    // );
                    msg2 = abi.encodePacked(
                        msg2,
                        // messageHash
                        call.functionSignature !=
                            0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
                            ? keccak256(
                                abi.encode(
                                    call.typeHash,
                                    _calcMultiSigTransactionHash(call),
                                    call.data
                                )
                            )
                            : call.to != address(0)
                            ? keccak256(
                                abi.encode(
                                    call.typeHash,
                                    _calcMultiSigTransactionHash(call)
                                )
                            )
                            : keccak256(
                                abi.encode(
                                    BATCH_MULTI_SIG_CALL_APPROVAL_TYPEHASH_,
                                    call.from
                                )
                            )
                    );
                }
                //console.log("ori 1");
                bytes32 messageHash = _messageToRecover(
                    keccak256(msg2),
                    sessionId & FLAG_EIP712 != 0
                );
                //console.log("ori 2");
                require(s_fcts[messageHash] == 0, "allready executed");
                s_fcts[messageHash] = 1;
                //console.log("ori 3");

                address[] memory signers = new address[](
                    mcalls.signatures.length
                );
                for (uint256 s = 0; s < mcalls.signatures.length; ++s) {
                    Signature calldata signature = mcalls.signatures[s];
                    signers[s] = _addressFromMessageAndSignature(
                        messageHash,
                        signature.v,
                        signature.r,
                        signature.s
                    );
                }
                // address[] memory signers = new address[](length);

                // for (uint256 k = 0; k < length; ++k) {
                //     MSCall calldata call = mcalls.mcall[k];
                //     for (uint256 s = 0; s < mcalls.signatures.length; ++s) {
                //         Signature calldata signature = mcalls.signatures[s];
                //         address callSigner = call.signer;
                //         {
                //             uint256 signerId = uint256(uint160(call.signer));
                //             if (signerId > VAR_MIN && signerId < VAR_MAX) {
                //                 require(
                //                     signerId & VAR_MASK <= variables_.length,
                //                     "Factory: var out of bound"
                //                 );

                //                 callSigner = address(
                //                     uint160(
                //                         uint256(
                //                             variables_[
                //                                 (signerId & VAR_MASK) - 1
                //                             ]
                //                         )
                //                     )
                //                 );
                //                 for (uint256 l = 0; l < length; ++l) {
                //                     require(
                //                         callSigner != mcalls.mcall[l].signer,
                //                         "Factory: singer exists"
                //                     );
                //                 }
                //             }
                //         }
                //         address signer = _addressFromMessageAndSignature(
                //             messageHash,
                //             signature.v,
                //             signature.r,
                //             signature.s
                //         );
                //         // console.log('signer', signer);
                //         // console.log('callSigner %s %s', k, callSigner);
                //         if (signer == callSigner) {
                //             signers[k] = signer;
                //             break;
                //         }
                //     }
                // }

                MultiSigCallLocals memory locals;
                {
                    locals.sessionId = sessionId;
                    locals.index = i;
                    locals.constGas = constGas;
                    locals.trxCounter = trLength;
                    if (sessionId & FLAG_CANCELABLE != 0) {
                        locals.messageHash = messageHash;
                    }
                    locals.rt = rt;
                    locals.rt[locals.index] = new MReturn[](length);
                    locals.gas = IGas - gasleft();
                }

                locals.returnedValues = new bytes[](length);
                //console.log("gas until j:", locals.gas);
                for (uint256 j = 0; j < length; ++j) {
                    // console.log(
                    //     "------------------ FTC %s ------------------",
                    //     j + 1
                    // );
                    uint256 gas = gasleft();

                    // require(
                    //     signers[j] != address(0),
                    //     "Factory: signer missing"
                    // );
                    MSCall calldata call = mcalls.mcall[j];
                    // console.log(
                    //     "proxy: call.to %s, call.value %s",
                    //     call.to,
                    //     call.value
                    // );
                    if (call.to == address(0)) {
                        continue;
                    }

                    // Wallet storage wallet = s_accounts_wallet[signers[j]];
                    // require(wallet.owner, "Factory: signer is not owner");
                    MultiSigInternalCallLocals memory varLocals;
                    {
                        varLocals.callFrom = call.from;
                        if (
                            uint256(uint160(varLocals.callFrom)) > VAR_MIN &&
                            uint256(uint160(varLocals.callFrom)) < VAR_MAX
                        ) {
                            require(
                                uint256(uint160(varLocals.callFrom)) &
                                    VAR_MASK <=
                                    variables_.length,
                                "Factory: var out of bound"
                            );
                            varLocals.callFrom = address(
                                uint160(
                                    uint256(
                                        variables_[
                                            (uint256(
                                                uint160(varLocals.callFrom)
                                            ) & VAR_MASK) - 1
                                        ]
                                    )
                                )
                            );
                            for (uint256 l = 0; l < length; ++l) {
                                require(
                                    varLocals.callFrom != mcalls.mcall[l].from,
                                    "FCT: from exists"
                                );
                            }
                        } else if (
                            uint256(uint160(varLocals.callFrom)) > RET_MIN &&
                            uint256(uint160(varLocals.callFrom)) < RET_MAX
                        ) {
                            varLocals.callFrom = abi.decode(
                                locals.returnedValues[
                                    (uint256(uint160(varLocals.callFrom)) &
                                        VAR_MASK) - 1
                                ],
                                (address)
                            );
                            for (uint256 l = 0; l < length; ++l) {
                                require(
                                    varLocals.callFrom != mcalls.mcall[l].from,
                                    "FCT: from exists"
                                );
                            }
                        }
                    }

                    require(
                        IFCT_Runner(varLocals.callFrom).allowedToExecute_(
                            signers,
                            0
                        ) > 0,
                        "FCT: signers not allowed"
                    );

                    {
                        varLocals.callTo = call.to;
                        if (
                            uint256(uint160(varLocals.callTo)) > VAR_MIN &&
                            uint256(uint160(varLocals.callTo)) < VAR_MAX
                        ) {
                            require(
                                uint256(uint160(varLocals.callTo)) & VAR_MASK <=
                                    variables_.length,
                                "FCT: var out of bound"
                            );
                            varLocals.callTo = address(
                                uint160(
                                    uint256(
                                        variables_[
                                            (uint256(
                                                uint160(varLocals.callTo)
                                            ) & VAR_MASK) - 1
                                        ]
                                    )
                                )
                            );
                        } else if (
                            uint256(uint160(varLocals.callTo)) > RET_MIN &&
                            uint256(uint160(varLocals.callTo)) < RET_MAX
                        ) {
                            // varLocals.callTo = abi.decode(
                            //     locals.returnedValues[
                            //         (uint256(uint160(varLocals.callTo)) &
                            //             VAR_MASK) - 1
                            //     ],
                            //     (address)
                            // );

                            require(
                                (uint256(uint160(varLocals.callTo)) &
                                    VAR_MASK) <= j,
                                "FCT: tx out of bound"
                            );
                            bytes memory varData = varLocals.data;
                            uint256 innerIndex = (uint256(
                                uint160(varLocals.callTo)
                            ) & RET_MASK) + 1;

                            require(
                                innerIndex * 32 < varData.length,
                                "FCT: inner out of bound"
                            );
                            varLocals.callTo = abi.decode(
                                locals.returnedValues[
                                    (varLocals.value & VAR_MASK) - 1
                                ],
                                (address)
                            );
                            uint256 dataIndex = varLocals.dataIndex;
                            address callTo = varLocals.callTo;
                            assembly {
                                mstore(
                                    add(
                                        varData,
                                        add(dataIndex, mul(innerIndex, 0x20))
                                    ),
                                    callTo
                                )
                            }
                        }
                    }
                    {
                        varLocals.value = call.value;
                        if (
                            (varLocals.value > VAR_MIN &&
                                varLocals.value < VAR_MAX) ||
                            (varLocals.value > VARX_MIN &&
                                varLocals.value < VARX_MAX)
                        ) {
                            require(
                                (varLocals.value & VAR_MASK) <=
                                    variables_.length,
                                "FCT: var out of bound"
                            );
                            varLocals.value = uint256(
                                variables_[(varLocals.value & VAR_MASK) - 1]
                            );
                        } else if (
                            (varLocals.value > RET_MIN &&
                                varLocals.value < RET_MAX) ||
                            (varLocals.value > RETX_MIN &&
                                varLocals.value < RETX_MAX)
                        ) {
                            require(
                                (varLocals.value & VAR_MASK) <= j,
                                "FCT: tx out of bound"
                            );
                            bytes memory varData = varLocals.data;
                            uint256 innerIndex = (varLocals.value & RET_MASK) +
                                1;

                            require(
                                innerIndex * 32 < varData.length,
                                "FCT: inner out of bound"
                            );
                            varLocals.value = abi.decode(
                                locals.returnedValues[
                                    (varLocals.value & VAR_MASK) - 1
                                ],
                                (uint256)
                            );
                            uint256 dataIndex = varLocals.dataIndex;
                            uint256 value = varLocals.value;
                            assembly {
                                mstore(
                                    add(
                                        varData,
                                        add(dataIndex, mul(innerIndex, 0x20))
                                    ),
                                    value
                                )
                            }
                        }
                    }
                    varLocals.data = call.data;
                    if (call.data.length > 0) {
                        // console.log("varData Before");
                        // console.logBytes(varLocals.data);
                        for (
                            varLocals.dataIndex = 0;
                            varLocals.dataIndex <= call.data.length - 32;
                            varLocals.dataIndex = varLocals.dataIndex + 32
                        ) {
                            {
                                varLocals.varId = abi.decode(
                                    call.data[varLocals.dataIndex:varLocals
                                        .dataIndex + 32],
                                    (uint256)
                                );
                                if (
                                    (varLocals.varId > VAR_MIN &&
                                        varLocals.varId < VAR_MAX) ||
                                    (varLocals.varId > VARX_MIN &&
                                        varLocals.varId < VARX_MAX)
                                ) {
                                    require(
                                        (varLocals.varId & VAR_MASK) <=
                                            variables_.length,
                                        "FCT: var out of bound"
                                    );

                                    varLocals.varValue = variables_[
                                        (varLocals.varId & VAR_MASK) - 1
                                    ];
                                } else if (
                                    (varLocals.varId > RET_MIN &&
                                        varLocals.varId < RET_MAX) ||
                                    (varLocals.varId > RETX_MIN &&
                                        varLocals.varId < RETX_MAX)
                                ) {
                                    require(
                                        (varLocals.varId & VAR_MASK) <= j,
                                        "FCT: tx out of bound"
                                    );
                                    bytes memory varData = varLocals.data;
                                    uint256 innerIndex = (varLocals.varId &
                                        RET_MASK) + 1;

                                    require(
                                        innerIndex * 32 < varData.length,
                                        "FCT: inner out of bound"
                                    );

                                    // bytes32 varValue = varLocals.varValue;
                                    // uint256 dataIndex = varLocals.dataIndex;

                                    // console.log("inner index %s", innerIndex);
                                    // assembly {
                                    //     mstore(
                                    //         add(
                                    //             varData,
                                    //             add(
                                    //                 dataIndex,
                                    //                 mul(innerIndex, 0x20)
                                    //             )
                                    //         ),
                                    //         varValue
                                    //     )
                                    // }

                                    varLocals.varValue = abi.decode(
                                        locals.returnedValues[
                                            (varLocals.varId & VAR_MASK) - 1
                                        ],
                                        (bytes32)
                                    );
                                }
                            }
                            {
                                if (
                                    (varLocals.varId > VAR_MIN &&
                                        varLocals.varId < VAR_MAX) ||
                                    (varLocals.varId > RET_MIN &&
                                        varLocals.varId < RET_MAX) ||
                                    (varLocals.varId > VARX_MIN &&
                                        varLocals.varId < VARX_MAX) ||
                                    (varLocals.varId > RETX_MIN &&
                                        varLocals.varId < RETX_MAX)
                                ) {
                                    bytes memory varData = varLocals.data;
                                    uint256 dataIndex = varLocals.dataIndex;
                                    bytes32 varValue = varLocals.varValue;
                                    uint256 innerIndex = (varLocals.varId &
                                        RET_MASK) + 1;
                                    // require(
                                    //     innerIndex * 32 < varData.length,
                                    //     "Factory: inner out of bound"
                                    // );
                                    // console.log("inner index %s", innerIndex);
                                    assembly {
                                        mstore(
                                            add(
                                                varData,
                                                add(
                                                    dataIndex,
                                                    mul(innerIndex, 0x20)
                                                )
                                            ),
                                            varValue
                                        )
                                    }
                                }
                            }
                        }
                        // console.log("varData After");
                        // console.logBytes(varLocals.data);
                    }

                    (bool success, bytes memory res) = _executeCall(
                        varLocals.callFrom, // wallet.addr,
                        _ensToAddress(call.ensHash, varLocals.callTo),
                        call.flags,
                        call.gasLimit,
                        locals.messageHash,
                        call.functionSignature,
                        varLocals.value,
                        varLocals.data
                    );
                    if (success) {
                        // console.log("Returned bytes %s", res.length);
                        // console.logBytes(res);
                        if (res.length > 64) {
                            // console.log(
                            //     "Keeping value %s",
                            //     abi.decode(abi.decode(res, (bytes)), (address))
                            // );
                            locals.returnedValues[j] = abi.decode(res, (bytes));
                            // locals.returnedValues[j] = abi.decode(
                            //     abi.decode(res, (bytes)),
                            //     (bytes32)
                            // );
                        }
                    }

                    uint256 additionalGasPerVault = (locals.gas / length) +
                        (33000 / (locals.trxCounter * length));
                    if (!success) {
                        emit BatchMultiSigCallFailed_(
                            varLocals.callFrom, // wallet.addr,
                            0,
                            locals.index,
                            j
                        );
                        if (call.flags & FLAG_FLOW >= OK_CONT_FAIL_JUMP) {
                            locals.rt[locals.index][j] = gasDiff(
                                varLocals.callFrom, // wallet.addr,
                                gas,
                                additionalGasPerVault
                            );
                            if (call.flags & FLAG_FLOW >= OK_CONT_FAIL_JUMP) {
                                j = j + (call.flags & FLAG_JUMP);
                            }
                            continue;
                        } else if (
                            call.flags & FLAG_FLOW == OK_CONT_FAIL_STOP
                        ) {
                            locals.rt[locals.index][j] = gasDiff(
                                varLocals.callFrom, // wallet.addr,
                                gas,
                                additionalGasPerVault
                            );
                            break;
                        }
                        revert(_getRevertMsg(res));
                    } else if (call.flags & FLAG_FLOW == OK_STOP_FAIL_CONT) {
                        locals.rt[locals.index][j] = gasDiff(
                            varLocals.callFrom, // wallet.addr,
                            gas,
                            additionalGasPerVault
                        );
                        break;
                    } else if (call.flags & FLAG_FLOW == OK_REVERT_FAIL_CONT) {
                        revert("FCT: revert on success");
                    } else if (call.flags & FLAG_FLOW == OK_JUMP_FAIL_CONT) {
                        j = j + (call.flags & FLAG_JUMP);
                    }

                    // uint88 refund;
                    // if (locals.sessionId & FLAG_PAYMENT != 0) {
                    //     refund = _calcRefund(
                    //         wallet.debt,
                    //         locals.gas,
                    //         locals.constGas,
                    //         uint64(locals.sessionId >> 16) /*gasPriceLimit*/
                    //     );
                    //     wallet.debt += refund;
                    // }
                    //console.log("proxy: wallet.addr: %s , i: %s, j: %s", wallet.addr, locals.index, j);
                    locals.rt[locals.index][j] = gasDiff(
                        varLocals.callFrom, // wallet.addr,
                        gas,
                        additionalGasPerVault
                    ); //MReturn(wallet.addr, refund);
                }
            }
            // s_nonce_group[ng] = _nextNonce(nonce, maxNonce);
            emit BatchTransfered_(3, block.number, 0);
        }
        //console.log("proxy: gasUsage", startGas - gasleft());
    }

    function gasDiff(
        address wallet,
        uint256 gas,
        uint256 additionalGas
    ) internal view returns (MReturn memory) {
        //console.log("gasDiff: wallet: %s, gas: %s, additionalGas: %s", wallet, gas - gasleft() + additionalGas, additionalGas);
        return MReturn(wallet, uint88(gas - gasleft() + additionalGas));
    }

    /*
    function batchMultiSigCallPacked_(
        PackedMSCalls[] calldata tr,
        uint256 nonceGroup
    ) external {
        require(msg.sender == s_activator, "Wallet: sender not allowed");
        unchecked {
            uint256 ng = nonceGroup;
            uint256 nonce = s_nonce_group[ng] + (ng << GROUP_BIT);
            uint256 maxNonce = 0;
            uint256 constGas = (21000 + msg.data.length * 8) / tr.length;
            for (uint256 i = 0; i < tr.length; i++) {
                uint256 gas = gasleft();
                PackedMSCalls calldata mcalls = tr[i];
                uint256 sessionId = mcalls.sessionId;
                bytes32 messageHash;
                uint256 length = mcalls.mcall.length;
                address[] memory signers = new address[](length);
                {
                    bytes memory msg2 = abi.encode(
                        BATCH_MULTI_SIG_CALL_TYPEHASH_,
                        keccak256(
                            abi.encode(
                                PACKED_BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH_,
                                sessionId
                            )
                        )
                    );

                    // _checkSessionIdLimits(i, sessionId, nonce, maxNonce);
                    _checkSessionIdLimits(sessionId);
                    // maxNonce = sessionId;

                    for (uint256 j = 0; j < length; j++) {
                        PackedMSCall calldata call = mcalls.mcall[j];
                        msg2 = abi.encodePacked(
                            msg2,
                            keccak256(
                                abi.encode(
                                    PACKED_BATCH_MULTI_SIG_CALL_TRANSACTION_TYPEHASH_,
                                    call.signer,
                                    call.to,
                                    call.value,
                                    call.gasLimit,
                                    call.flags,
                                    call.data
                                )
                            )
                        );
                    }

                    messageHash = _messageToRecover(
                        keccak256(msg2),
                        sessionId & FLAG_EIP712 > 0
                    );

                    require(s_fcts[messageHash] == 0, "allready executed");
                    s_fcts[messageHash] = 1;

                    for (uint256 s = 0; s < mcalls.signatures.length; ++s) {
                        Signature calldata signature = mcalls.signatures[s];
                        for (uint256 j = 0; j < length; j++) {
                            PackedMSCall calldata call = mcalls.mcall[j];
                            address signer = _addressFromMessageAndSignature(
                                messageHash,
                                signature.v,
                                signature.r,
                                signature.s
                            );
                            if (
                                signer == call.signer &&
                                signers[j] == address(0)
                            ) {
                                signers[j] = signer;
                            }
                        }
                    }
                }
                uint256 localConstGas;
                uint256 localNonce;
                {
                    localConstGas = constGas;
                    localNonce = nonce;
                }

                for (uint256 j = 0; j < length; j++) {
                    require(
                        signers[j] != address(0),
                        "Factory: signer missing"
                    );
                    Wallet storage wallet = s_accounts_wallet[signers[j]];
                    require(wallet.owner, "Factory: signer is not owner");
                    PackedMSCall calldata call = mcalls.mcall[j];
                    if (call.to == address(0)) {
                        continue;
                    }
                    bytes32 localMessageHash;
                    uint256 localIndex;
                    uint256 localGas;
                    uint256 localSessionId;
                    {
                        localMessageHash = messageHash;
                        localIndex = i;
                        localGas = gas;
                        localSessionId = sessionId;
                    }

                    (bool success, bytes memory res) = _executePackedCall(
                        wallet.addr,
                        call.to,
                        call.flags,
                        call.gasLimit,
                        localMessageHash,
                        call.value,
                        call.data
                    );

                    if (!success) {
                        emit BatchMultiSigCallPackedFailed_(
                            wallet.addr,
                            localNonce,
                            localIndex,
                            j
                        );
                        if (call.flags & ON_FAIL_CONTINUE > 0) {
                            continue;
                        } else if (call.flags & ON_FAIL_STOP > 0) {
                            break;
                        }
                        revert(_getRevertMsg(res));
                    } else if (call.flags & ON_SUCCESS_STOP > 0) {
                        break;
                    } else if (call.flags & ON_SUCCESS_REVERT > 0) {
                        revert("Factory: revert on success");
                    }
                    if (
                        localSessionId & FLAG_PAYMENT > 0 // refund
                    ) {
                        wallet.debt += _calcRefund(
                            wallet.debt,
                            localGas,
                            localConstGas,
                            uint64(localSessionId >> 16) // gasPriceLimit
                        );
                    }
                }
            }
            s_nonce_group[ng] = _nextNonce(nonce, maxNonce);
            emit BatchTransfered_(7, block.number, maxNonce);
        }
    }
*/
    function _calcMultiSigTransactionHash(
        MSCall memory call // , address[] memory addresses
    ) private pure returns (bytes32) {
        uint16 flags = call.flags;

        return
            keccak256(
                abi.encode(
                    BATCH_MULTI_SIG_CALL_TRANSACTION_TYPEHASH_,
                    call.from,
                    call.to,
                    call.ensHash,
                    call.value,
                    call.gasLimit,
                    flags & FLAG_STATICCALL > 0,
                    _getFlowHash(flags & FLAG_FLOW),
                    uint8(flags & FLAG_JUMP),
                    call.functionSignature
                )
            );
    }

    function _getFlow(bytes32 flowHash) private pure returns (uint256) {
        if (flowHash == OK_CONT_FAIL_REVERT_HASH) {
            return OK_CONT_FAIL_REVERT;
        }
        if (flowHash == OK_CONT_FAIL_STOP_HASH) {
            return OK_CONT_FAIL_STOP;
        }
        if (flowHash == OK_CONT_FAIL_JUMP_HASH) {
            return OK_CONT_FAIL_JUMP;
        }
        if (flowHash == OK_REVERT_FAIL_CONT_HASH) {
            return OK_REVERT_FAIL_CONT;
        }
        if (flowHash == OK_STOP_FAIL_CONT_HASH) {
            return OK_STOP_FAIL_CONT;
        }
        if (flowHash == OK_JUMP_FAIL_CONT_HASH) {
            return OK_JUMP_FAIL_CONT;
        }
        return 0x0;
    }

    function _getFlowHash(uint256 flow) private pure returns (bytes32) {
        if (flow == OK_CONT_FAIL_REVERT) {
            return OK_CONT_FAIL_REVERT_HASH;
        }
        if (flow == OK_CONT_FAIL_STOP) {
            return OK_CONT_FAIL_STOP_HASH;
        }
        if (flow == OK_CONT_FAIL_JUMP) {
            return OK_CONT_FAIL_JUMP_HASH;
        }
        if (flow == OK_REVERT_FAIL_CONT) {
            return OK_REVERT_FAIL_CONT_HASH;
        }
        if (flow == OK_STOP_FAIL_CONT) {
            return OK_STOP_FAIL_CONT_HASH;
        }
        if (flow == OK_JUMP_FAIL_CONT) {
            return OK_JUMP_FAIL_CONT_HASH;
        }
        return 0x0;
    }

    function _checkSessionIdLimits(uint256 sessionId) private view {
        require(
            tx.gasprice <= uint64(sessionId >> GAS_PRICE_LIMIT_BIT),
            "FCT: gas price too high"
        );
        require(
            block.timestamp > uint40(sessionId >> AFTER_TS_BIT),
            "FCT: too early"
        );
        require(
            block.timestamp < uint40(sessionId >> BEFORE_TS_BIT),
            "FCT: too late"
        );
    }
}
