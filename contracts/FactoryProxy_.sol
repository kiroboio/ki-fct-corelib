// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import "./FactoryStorage.sol";
import "./interfaces/IFactoryProxy.sol";
import "./interfaces/IFCT_Runner.sol";
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

struct Call {
    bytes32 r;
    bytes32 s;
    bytes32 typeHash;
    address to;
    bytes32 ensHash;
    uint256 value;
    uint256 sessionId;
    // address signer;
    address from;
    bytes32 functionSignature;
    bytes data;
}

struct PackedMSCall {
    uint256 value;
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
    uint256 sessionId;
}

contract FactoryProxy_ is FactoryStorage {
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

    // Stubs ends

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

    constructor() FactoryStorage() {}

    fallback() external {
        assembly {
            calldatacopy(0x00, 0x00, calldatasize())
            let res := delegatecall(
                gas(),
                sload(s_target_.slot),
                0x00,
                calldatasize(),
                0,
                0
            )
            returndatacopy(0x00, 0x00, returndatasize())
            if res {
                return(0x00, returndatasize())
            }
            revert(0x00, returndatasize())
        }
    }

    function setTarget_(address target) external onlyOwner {
        require(!s_frozen_, "frozen");
        require(target != address(0), "no target");
        s_target_ = target;
    }

    function freezeTarget_() external onlyOwner {
        s_frozen_ = true;
    }

    function setActivator_(address newActivator) external onlyOwner {
        s_activator = newActivator;
    }

    function setLocalEns_(string calldata ens, address dest)
        external
        onlyOwner
    {
        s_local_ens[keccak256(abi.encodePacked("@", ens))] = dest;
    }

    function collectDebt_(address account, address recipient) external {
        unchecked {
            require(recipient != address(0), "Wallet: no recipient");
            require(msg.sender == s_activator, "Wallet: sender not allowed");
            Wallet storage wallet = s_accounts_wallet[account];
            uint256 debt = wallet.debt;
            if (debt > 0) {
                wallet.debt = 0;
                (bool success, bytes memory res) = wallet.addr.call(
                    abi.encodeWithSignature(
                        "transferEth(address,uint256,bytes32)",
                        recipient,
                        debt,
                        bytes32(0)
                    )
                );
                if (!success) {
                    revert(_getRevertMsg(res));
                }
            }
        }
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
        // console.log("_executeCall, wallet:%s, to:%s, value:%s", wallet, to, value);
        // console.log("packed",packed);
        // console.logBytes32(messageHash);
        // console.logBytes32(functionSignature);
        // console.logBytes(data);

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

    struct TYPES {
        string arg1;
        string arg2;
        string arg3;
    }

    uint256 constant TYPE_NATIVE = 0;
    uint256 constant TYPE_STRING = 1;
    uint256 constant TYPE_BYTES = 2;

    function _decodeString(bytes calldata data, uint256 pos)
        private
        pure
        returns (string memory)
    {
        //console.logBytes(data);
        bytes memory strData = bytes.concat(
            abi.encode(0x20),
            data[(pos + 3) * 32:(pos + 5)* 32]
        );
        //console.log("print");
        //console.logBytes(strData);
        return abi.decode(strData, (string));
    }//ori shalom

    function _decodeBytes(bytes calldata data, uint256 pos)
        private
        pure
        returns (bytes memory)
    {
        bytes memory strData = bytes.concat(
            abi.encode(0x20),
            data[(pos + 3) * 32:(pos + 5)* 32]
        );
        return abi.decode(strData, (bytes));
    }
//to,tokenAmount,
    function abiToEIP712(bytes calldata data, uint256[] memory types)
        public
        pure
        returns (bytes memory res)
    {
        uint256 j = 0;
        for (uint256 i = 0; i < types.length; ++i) {
            if (types[i] == TYPE_STRING) {
                //console.log("string:", i);
                string memory str = _decodeString(data, i +j);
                //console.log(str);
                bytes memory buff = abi.encodePacked(str);
                res = bytes.concat(res, keccak256(buff));
                j = j + 1;
            } else if (types[i] == TYPE_BYTES) {
                //console.log("bytes:", i);
                bytes memory bytesData = _decodeBytes(data, i +j);
                //console.logBytes(bytesData);
                res = bytes.concat(res, keccak256(bytesData));
                j = j + 1;//+ bytesData.length;
            } else {
                //console.log("basic:", i);
                res = bytes.concat(res, data[i * 32:(i + 1) * 32]);
            }
        }
    }

    // Batch Call: Multi Signature, Multi External Contract Functions
    function batchMultiSigCall_(
        MSCalls[] calldata tr,
        bytes32[][] calldata variables
    ) external returns (MReturn[][] memory rt) {
        // uint256 startGas = gasleft();
        require(msg.sender == s_activator, "Wallet: sender not allowed");
        rt = new MReturn[][](tr.length);
        unchecked {
            uint256 trLength = tr.length;
            uint256 constGas = (21000 + msg.data.length * 8) / trLength;
            //console.log("gas until i:",startGas- gasleft() );
            for (uint256 i = 0; i < trLength; ++i) {
                bytes32[] calldata variables_ = variables[i];
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
                    // console.log(
                    //     "-------------------------- string -----------------------"
                    // );
                    // console.logBytes(call.data);
                    
                    // (, , string memory r, string memory b, bytes memory x) = abi.decode(
                    //     call.data,
                    //     (address, uint256, string, string, bytes)
                    // );
                    // (, , string memory r) = abi.decode(
                    //     call.data,
                    //     (address, uint256, string)
                    // );
                    // console.log(r);
                    // console.logBytes32(keccak256(abi.encodePacked(r)));
                    // console.log(b);
                    // console.logBytes32(keccak256(abi.encodePacked(b)));
                    // console.logBytes(x);
                    // console.logBytes32(keccak256(abi.encodePacked(x)));
                    // uint256[] memory types = new uint256[](5);
                    // types[0] = TYPE_NATIVE;
                    // types[1] = TYPE_NATIVE;
                    // types[2] = TYPE_STRING;
                    // types[3] = TYPE_STRING;
                    // types[4] = TYPE_BYTES;
                    //console.log("t1:%s, t2:%s", call.types[0], call.types[1]);
                    console.logBytes(call.types.length > 0 ? abiToEIP712(call.data, call.types) : call.data);
                   

                    msg2 = abi.encodePacked(
                        msg2,
                        // messageHash
                        call.functionSignature !=
                            0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
                            ? keccak256(
                                abi.encodePacked(
                                    abi.encode(
                                        call.typeHash,
                                        _calcMultiSigTransactionHash(call)
                                    ),
                                    call.types.length > 0 ? abiToEIP712(call.data, call.types) : call.data
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
                console.log('message hash 1');
                console.logBytes32(keccak256(msg2));
                bytes32 messageHash = _messageToRecover(
                    keccak256(msg2),
                    sessionId & FLAG_EIP712 != 0
                );
                console.log('message hash 2');
                console.logBytes32(messageHash);
                require(s_fcts[messageHash] == 0, "allready executed");
                s_fcts[messageHash] = 1;

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
                    //console.log("test1");
                    uint256 gas = gasleft();

                    // require(
                    //     signers[j] != address(0),
                    //     "Factory: signer missing"
                    // );
                    MSCall calldata call = mcalls.mcall[j];
                    //console.log("test2");
                    // console.log(
                    //     "proxy: call.to %s, call.value %s",
                    //     call.to,
                    //     call.value
                    // );
                    if (call.to == address(0)) {
                        continue;
                    }
                   // console.log("test3");
                    // Wallet storage wallet = s_accounts_wallet[signers[j]];
                    // require(wallet.owner, "Factory: signer is not owner");
                    MultiSigInternalCallLocals memory varLocals;
                    {
                        //console.log("test3.1, call.from:", call.from);
                        varLocals.callFrom = call.from;
                        if (
                            uint256(uint160(varLocals.callFrom)) > VAR_MIN &&
                            uint256(uint160(varLocals.callFrom)) < VAR_MAX
                        ) {
                            //console.log("test3.2");
                            require(
                                uint256(uint160(varLocals.callFrom)) &
                                    VAR_MASK <=
                                    variables_.length,
                                "Factory: var out of bound"
                            );
                            //console.log("test3.3, index: ", (uint256(uint160(varLocals.callFrom)) & VAR_MASK) - 1);
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
                            //console.log("test3.4");
                            for (uint256 l = 0; l < length; ++l) {
                                require(
                                    varLocals.callFrom != mcalls.mcall[l].from,
                                    "FCT: from exists"
                                );
                            }
                           // console.log("test3.5");
                        } else if (
                            uint256(uint160(varLocals.callFrom)) > RET_MIN &&
                            uint256(uint160(varLocals.callFrom)) < RET_MAX
                        ) {
                            //console.log("test3.6");
                            varLocals.callFrom = abi.decode(
                                locals.returnedValues[
                                    (uint256(uint160(varLocals.callFrom)) &
                                        VAR_MASK) - 1
                                ],
                                (address)
                            );
                            //console.log("test3.7");
                            for (uint256 l = 0; l < length; ++l) {
                                require(
                                    varLocals.callFrom != mcalls.mcall[l].from,
                                    "FCT: from exists"
                                );
                            }
                            //console.log("test3.8");
                        }
                        //console.log("test3.9");
                    }
                    //console.log("test3.10, varLocals.callFrom:", varLocals.callFrom);
                    require(
                        IFCT_Runner(varLocals.callFrom).allowedToExecute_(
                            signers,
                            0
                        ) > 0,
                        "FCT: signers not allowed"
                    );
                    //console.log("test4, call.to:", call.to);
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
                    //console.log("test5, varLocals.callTo: ", varLocals.callTo);
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
                    //console.log("test6");
                    varLocals.data = call.data;
                    if (call.data.length > 0) {
                        //  console.log("varData Before");
                        //  console.logBytes(varLocals.data);
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
                    }
                    // console.log("varLocals.callFrom", varLocals.callFrom);
                    // console.log("call.flags", call.flags);
                    // console.logBytes32(call.functionSignature);
                    // console.log("varLocals.value", varLocals.value);
                    // console.logBytes(varLocals.data);
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
                        //console.log("success");
                        if (res.length > 64) {
                            locals.returnedValues[j] = abi.decode(res, (bytes));
                            // locals.returnedValues[j] = abi.decode(
                            //     abi.decode(res, (bytes)),
                            //     (bytes32)
                            // );
                        }
                    }
                    //console.log("ori 1");
                    uint256 additionalGasPerVault = (locals.gas / length) +
                        (33000 / (locals.trxCounter * length));
                    if (!success) {
                        //console.log("ori 2");
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
                        //console.log("ori 3");
                        locals.rt[locals.index][j] = gasDiff(
                            varLocals.callFrom, // wallet.addr,
                            gas,
                            additionalGasPerVault
                        );
                        break;
                    } else if (call.flags & FLAG_FLOW == OK_REVERT_FAIL_CONT) {
                        //console.log("ori 4");
                        revert("FCT: revert on success");
                    } else if (call.flags & FLAG_FLOW == OK_JUMP_FAIL_CONT) {
                        //console.log("ori 5");
                        j = j + (call.flags & FLAG_JUMP);
                    }
                    //console.log("ori 6");
                    locals.rt[locals.index][j] = gasDiff(
                        varLocals.callFrom, // wallet.addr,
                        gas,
                        additionalGasPerVault
                    ); //MReturn(wallet.addr, refund);
                    //console.log("ori 7");
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
    /** @notice _calcRefund - calculates the amount of refund to give based on the following input params:
        @param debt(uint256)
        @param gas(uint256)
        @param constGas(uint256)
        @param gasPriceLimit(uint256)
        @return uint88
    */
    function _calcRefund(
        uint256 debt,
        uint256 gas,
        uint256 constGas,
        uint256 gasPriceLimit
    ) private view returns (uint88) {
        //console.log("tx.gasprice",tx.gasprice);
        //console.log("gasPriceLimit",gasPriceLimit);
        return (
            debt != 0
                ? uint88(
                    (tx.gasprice + (gasPriceLimit - tx.gasprice) / 2) *
                        (((gas - gasleft()) * 110) / 100 + constGas + 5000)
                    // ((gas - gasleft())+20000)
                )
                : uint88(
                    (tx.gasprice + (gasPriceLimit - tx.gasprice) / 2) *
                        (((gas - gasleft()) * 110) / 100 + constGas + 8000)
                    //(((gas - gasleft())) + constGas + 8000)
                    //(tx.gasprice > gasPriceLimit ? tx.gasprice : gasPriceLimit) *
                    //    ((gas - gasleft())+20000)
                )
        );
    }

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
        console.log('block.timestamp',block.timestamp);
        console.log("input timestamp", uint40(sessionId >> AFTER_TS_BIT));
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
