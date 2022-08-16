// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import "./FCT_Constants.sol";
import "./interfaces/IFCT_Engine.sol";
import "./interfaces/IFCT_Controller.sol";
import "./interfaces/IFCT_Runner.sol";
import "./FCT_Helpers.sol";
import "hardhat/console.sol";

                                              // 1-7      8bit flags
uint256 constant GAS_PRICE_LIMIT_BIT = 8;  // 8-72     64bit gas price limit
uint256 constant BEFORE_TS_BIT = 72;       // 72-112   40bit before timestamp
uint256 constant AFTER_TS_BIT = 112;       // 112-152  40bit after timestamp
uint256 constant CHILL_TIME_BIT = 152;     // 152-184  32bit gas limit
uint256 constant RECURRENT_BIT = 184;      // 184-200  16bit nonce
uint256 constant VERSION_BIT = 200;        // 184-224  24bit nonce
uint256 constant EXT_SIGNERS_BIT = 224;       // 224-232  8bit nonce
uint256 constant SALT_BIT = 232;           // 232-256  24bit nonce

uint256 constant FLAG_CHILLMODE = 0x01;
uint256 constant FLAG_CANCELABLE = 0x02;
uint256 constant FLAG_EIP712 = 0x04;

// Info
// name
// version
// eip712
// random_id 

// Limits
// gaspricelimit - 64 bits                               - gas_price_limit
// before - 40 bits                                      - valid_from
// after - 40 bits                                       - expires_at
// flags (chillmode, cancelable, eip712) - 8 bits        - cancelable (bool)

// Recurrency
// recurrent - 16 bits                                   - max_repeats
// chilltime - 32 bits                                   - chill_time
// chilldmode (from flags())                             - accumetable (bool)

// Multisig
// addesses[]                                            - external_signers
// m_of_n - 8 bits                                       - minumum_approvals

// version - 24 bits                                     - version
// salt - 24 bits                                        - random_id
// array[]               

// 1-15     16bit flags
// uint256 constant GAS_PRICE_LIMIT_BIT = 16; // 16-70    64bit gas price limit
// uint256 constant GAS_LIMIT_BIT = 80; // 80-111   32bit gas limit
// uint256 constant BEFORE_TS_BIT = 112; // 112-151  40bit before timestamp
// uint256 constant AFTER_TS_BIT = 152; // 152-191  40bit after timestamp
// uint256 constant NONCE_BIT = 192; // 192-231  40bit nonce
// uint256 constant MAX_NONCE_JUMP_BIT = 216; // 216      24bit of nonce
// uint256 constant GROUP_BIT = 232; // 232-255  24bit group

// uint256 constant FLAG_EIP712 = 0x0100;
// uint256 constant FLAG_CANCELABLE = 0x0800;
// uint256 constant FLAG_PAYMENT = 0xf000;

uint256 constant FLAG_STATICCALL = 0x08;
uint256 constant FLAG_FLOW = 0x10;
uint256 constant FLAG_JUMP = 0x20;

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


contract FCT_BatchMultiSig is IFCT_Engine, FCT_Helpers {
    // using Variables for address;

    bytes3 public constant VERSION = bytes3(0x010101);


    bytes32 public constant batchMultiSigCallID = bytes32(
        abi.encodePacked(
            bytes4(FCT_BatchMultiSig.batchMultiSigCall_.selector),
            VERSION,
            bytes24(0x0)
        )
    );

    uint256 public constant OK_CONT_FAIL_REVERT = 0x0010;
    string public constant OK_CONT_FAIL_REVERT_MSG =
        "continue on success, revert on fail";
    bytes32 public constant OK_CONT_FAIL_REVERT_HASH =
        keccak256(abi.encodePacked(OK_CONT_FAIL_REVERT_MSG));

    uint256 public constant OK_CONT_FAIL_STOP = 0x0020;
    string public constant OK_CONT_FAIL_STOP_MSG =
        "continue on success, stop on fail";
    bytes32 public constant OK_CONT_FAIL_STOP_HASH =
        keccak256(abi.encodePacked(OK_CONT_FAIL_STOP_MSG));

    uint256 public constant OK_CONT_FAIL_JUMP = 0x0030;
    string public constant OK_CONT_FAIL_JUMP_MSG =
        "continue on success, jump on fail";
    bytes32 public constant OK_CONT_FAIL_JUMP_HASH =
        keccak256(abi.encodePacked(OK_CONT_FAIL_JUMP_MSG));

    uint256 public constant OK_REVERT_FAIL_CONT = 0x0040;
    string public constant OK_REVERT_FAIL_CONT_MSG =
        "revert on success, continue on fail";
    bytes32 public constant OK_REVERT_FAIL_CONT_HASH =
        keccak256(abi.encodePacked(OK_REVERT_FAIL_CONT_MSG));

    uint256 public constant OK_STOP_FAIL_CONT = 0x0050;
    string public constant OK_STOP_FAIL_CONT_MSG =
        "stop on success, continue on fail";
    bytes32 public constant OK_STOP_FAIL_CONT_HASH =
        keccak256(abi.encodePacked(OK_STOP_FAIL_CONT_MSG));

    uint256 public constant OK_JUMP_FAIL_CONT = 0x0060;
    string public constant OK_JUMP_FAIL_CONT_MSG =
        "jump on success, continue on fail";
    bytes32 public constant OK_JUMP_FAIL_CONT_HASH =
        keccak256(abi.encodePacked(OK_JUMP_FAIL_CONT_MSG));

   // Stubs: Taken from FactoryProxy
    uint8 public constant VERSION_NUMBER = 0x0;
    string public constant NAME = "";

    function _replace(address addr, bytes32[] calldata variables, uint256 j, bytes[] memory returnedValues) private pure returns (address) {
        uint256 value = uint256(uint160(addr));
        if (value > VAR_MIN && value < VAR_MAX) {
            require(value & VAR_MASK <= variables.length, "FCT: var out of bound");
            return address(uint160(uint256(variables[(value & VAR_MASK) - 1])));
        }
        if (value > RET_MIN && value < RET_MAX) {
            require((value & VAR_MASK) <= j, "FCT: tx out of bound");
            bytes memory data = returnedValues[(value & VAR_MASK) - 1];
            uint256 innerPos = ((value & RET_MASK) + 1) * 32;
            require(innerPos < data.length, "FCT: inner out of bound");
            assembly { mstore( addr, mload(add(data, innerPos))) }
        }
        return addr;
    }

    function _replace(uint256 value, bytes32[] calldata variables, uint256 j, bytes[] memory returnedValues) private pure returns (uint256) {
        if ((value > VAR_MIN && value < VAR_MAX) || (value > VARX_MIN && value < VARX_MAX)) {
            require(value & VAR_MASK <= variables.length, "FCT: var out of bound");
            return uint256(variables[(value & VAR_MASK) - 1]);
        }
        if ((value > RET_MIN && value < RET_MAX) || (value > RETX_MIN && value < RETX_MAX)) {
            require((value & VAR_MASK) <= j, "FCT: tx out of bound");
            bytes memory data = returnedValues[(value & VAR_MASK) - 1];
            uint256 innerPos = ((value & RET_MASK) + 1) * 32;
            require(innerPos < data.length, "FCT: inner out of bound");
            assembly { mstore( value, mload(add(data, innerPos))) }
        }
        return value;
    }

    function uid() external pure returns (bytes32) {
        return 0x00;
    }

    function activator() external pure returns (address) {
        return address(0);
    }

    // Stubs ends
    bytes32 public constant BATCH_MULTI_SIG_CALL_INFO_TYPEHASH_ =
        keccak256(
            "Info(string name,bytes3 version,bool eip712,bytes3 random_id)"
        );

    bytes32 public constant BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH_ =
        keccak256(
            "Limits(uint40 valid_from,uint40 expires_at,uint64 gas_price_limit,bool cancelable)"
        );

    bytes32 public constant BATCH_MULTI_SIG_CALL_RECURRENCY_TYPEHASH_ =
        keccak256(
            "Recurrency(uint16 max_repeats,uint32 chill_time,bool accumetable)"
        );

    bytes32 public constant BATCH_MULTI_SIG_CALL_MULTISIG_TYPEHASH_ =
        keccak256(
            "Multisig(address[] external_signers,uint8 minimum_approvals)"
        );

    bytes32 public constant BATCH_MULTI_SIG_CALL_TOKENTRANSFER_TYPEHASH_ =
        keccak256(
            "TokenTransfer(Transaction call,TokenTransferParams methodParams)"
        );

    bytes32 public constant BATCH_MULTI_SIG_CALL_TOKENTRANSFERPARAMS_TYPEHASH_ =
        keccak256(
            "TokenTransferParams(address to,uint256 token_amount)"
        );

    bytes32 public constant BATCH_MULTI_SIG_CALL_TRANSACTION_TYPEHASH_ =
        keccak256(
            "Transaction(address from,address to,string to_ens,uint256 eth_value,uint32 gas_limit,bool view_only,string flow_control,uint8 jump_over,string method_interface)"
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

    function getIDs() external pure returns (bytes32[] memory res) {
      res = new bytes32[](1);
      res[0] = batchMultiSigCallID;
    }

    function _executeCall(
        address wallet,
        address to,
        uint8 flags,
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

        // console.log('execute', wallet, to);
        // console.logBytes32(functionSignature);
        // console.logBytes(data);
        return flags & FLAG_STATICCALL != 0
                ? wallet.call{
                    gas: gasLimit == 0 || gasLimit > gasleft()
                        ? gasleft()
                        : gasLimit
                }(
                    abi.encodeWithSignature(
                        "LocalStaticCall_(bytes32,address,bytes,bytes32)",
                        batchMultiSigCallID,
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
                        "LocalCall_(bytes32,address,uint256,bytes,bytes32)",
                        batchMultiSigCallID,
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
        uint8 flags,
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
        uint8 flags,
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

    uint256 constant TYPE_STRING = 1000;
    uint256 constant TYPE_BYTES = 2000;
    uint256 constant TYPE_ARRAY = 3000;
    uint256 constant TYPE_NATIVE = 4000;


     function _decodeString(bytes calldata data, uint256 index)
        private
        pure
        returns (string memory)
    {
        // console.logBytes(data[(pos) * 32:(pos +2)* 32]);
        uint256 pos = abi.decode(data[(index) * 32:(index+1)* 32], (uint256));
        //console.log('pos', pos);
        bytes memory strData = bytes.concat(
            abi.encode(0x20),
            data[pos:]
        );
        //console.log("print");
        //console.logBytes(strData);
        return abi.decode(strData, (string));
    }

    function _decodeBytes(bytes calldata data, uint256 index)
        private
        pure
        returns (bytes memory)
    {
        uint256 pos = abi.decode(data[(index) * 32:(index+1)* 32], (uint256));
        bytes memory strData = bytes.concat(
            abi.encode(0x20),
            data[pos:]
        );
        return abi.decode(strData, (bytes));
    }

    // function _decodeSizeArray(bytes calldata data, uint256 pos)
    //     private
    //     pure
    //     returns (uint256)
    // {
    //     //console.logBytes(data);
    //     //console.logBytes(data[(pos + jump) * 32:(pos + jump+1)* 32]);
    //     //bytes memory strData = bytes.concat(abi.encode(0x20),data[(pos + jump) * 32:(pos + jump+1)* 32]);
    //     return abi.decode(data[(pos) * 32:(pos +1)* 32], (uint256));
    // }

    struct Offset {
        uint256 data;
        uint256 types;
    }

    struct Array {
        uint256 size;
        uint256 offset;
        uint256 typesOffset;
    }

    function abiToEIP712(bytes calldata data, uint256[] calldata types, bytes32[] calldata typedHashes, Offset memory offset)
    // function abiToEIP712(Eip712Converter memory info)
        public
        view
        returns (bytes memory res)
    {
        //console.logBytes(data);
        // uint256 j = offset;
        // uint256 t = typedHOffset;
        //console.log("types.length", types.length);
        for (uint256 i = 0; i < types.length ; i++) {
            if (types[i] == TYPE_STRING) {
                string memory str = _decodeString(data, offset.data);
                console.log("string: %s, str: %s",i, str);
                bytes memory buff = abi.encodePacked(str);
                res = bytes.concat(res, keccak256(buff));
                offset.data = offset.data + 1;
            } else if (types[i] == TYPE_BYTES) {
                console.log("bytes:", i);
                //console.log("bytes i:%s, j:%s, numOfElements:%s", i, j, numOfElements);
                bytes memory bytesData = _decodeBytes(data, offset.data);
                console.logBytes(bytesData);
                res = bytes.concat(res, keccak256(bytesData));
                offset.data = offset.data + 1;
            } else if ( types[i] == TYPE_ARRAY){
                console.log("array:", i);
                Array memory array;
                array.offset = abi.decode(data[offset.data*32:(offset.data+1)*32], (uint256));
                //console.log("array offset", arrayOffset);
                array.size = abi.decode(data[array.offset:array.offset+32], (uint256));
                //console.log("array size", arraySize);
                array.offset = array.offset + 32;
                // bytes calldata dataSubset = data[array.offset:];
                bytes memory arrayData;
                array.typesOffset = offset.types;
                    console.log("types[i+1]:", types[i+1]);                    
                    uint256[] calldata typesSubset = (types[i+1] < TYPE_STRING) ? types[i+1:i+2+types[i+1]] : types[i + 1 : i + 2];
                for (uint256 k=0; k < array.size; ++k) {
                    arrayData = bytes.concat(
                        arrayData,
                        abiToEIP712(data[array.offset:], typesSubset, typedHashes, Offset({ data: k, types:array.typesOffset })
                    ));
                  //console.logBytes(arrayData);
                }
                //console.log("back from array loop");
                res = bytes.concat(res, keccak256(arrayData));
                offset.data = offset.data + 1;
                offset.types = offset.types + 1;
                types[i+1] < TYPE_STRING ? i = i + types[i+1] + 1 : i = i + 1;
            } else if(types[i] < TYPE_STRING){
                console.log("struct:", i);
                uint256 numOfElements = types[i];
                console.log("num of elements in struct: %s", numOfElements);
                //console.log(offset.data);
                //console.logBytes(data);
                uint256 structOffset = abi.decode(data[offset.data*32:(offset.data+1)*32], (uint256));
                //console.log("structOffset", structOffset);
                bytes memory structData;
                //console.log("typedHashes[offset.types]");
                //console.logBytes32(typedHashes[offset.types]);
                structData = bytes.concat(structData, typedHashes[offset.types]);
                console.logBytes(structData);
                for (uint256 s=0; s < numOfElements; ++s) {
                    //console.log("in loop:", s);
                    uint256 typesOffset = offset.types;
                    //console.log("typesOffset:", typesOffset);
                    //console.log("types[i + 1 + s]:", types[i + 1 + s]);
                    structData = bytes.concat(
                        structData,
                        abiToEIP712(data[structOffset:],
                        types[i + 1 + s : i + 2 + s],
                        typedHashes,
                        Offset({ data: s, types: typesOffset }))
                    );
                }
                //console.log("back from structs loop");
                res = bytes.concat(res, keccak256(structData));
                offset.data = offset.data + 1;
                offset.types = offset.types + 1;
                i = i + numOfElements ;
            } else {
                console.log("basic:", i);
                res = bytes.concat(res, data[offset.data * 32:(offset.data + 1) * 32]);
                offset.data = offset.data + 1;
            }
        }
    }

    // Batch Call: Multi Signature, Multi External Contract Functions
    function batchMultiSigCall_(
        bytes3 version,
        MSCalls[] calldata tr
        // bytes32[][] calldata variablesx
    ) external returns (MReturn[][] memory rt) {
        console.log("in batchMultiSigCall_");
        // uint256 startGas = gasleft();
        // require(msg.sender == s_activator, "Wallet: sender not allowed");
        require(version == VERSION, "fct: wrong version");
        rt = new MReturn[][](tr.length);
        console.log("in batchMultiSigCall_ 2");
        unchecked {
            uint256 trLength = tr.length;
            uint256 constGas = (21000 + msg.data.length * 8) / trLength;
            //console.log("gas until i:",startGas- gasleft() );
            console.log("in batchMultiSigCall_ 3");
            for (uint256 i = 0; i < trLength; ++i) {
                // bytes32[] calldata variables_ = variables[i];
                uint256 IGas = gasleft();
                MSCalls calldata mcalls = tr[i];
                // console.log("proxy: i: ", i);
                uint256 sessionId = mcalls.sessionId;
                bytes memory msg2 = abi.encode(
                    mcalls.typeHash,
                    keccak256(
                        abi.encode(
                            BATCH_MULTI_SIG_CALL_INFO_TYPEHASH_,
                            mcalls.name,
                            uint24(sessionId >> VERSION_BIT),
                            sessionId & FLAG_EIP712 != 0,
                            uint24(sessionId >> SALT_BIT) //random_id
                        )
                    ));
                console.log("in batchMultiSigCall_ 4");
                msg2 = bytes.concat(msg2, abi.encode(
                    mcalls.typeHash,
                    keccak256(
                        abi.encode(
                            BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH_,
                            uint40(sessionId >> BEFORE_TS_BIT), // valid_from
                            uint40(sessionId >> AFTER_TS_BIT),
                            uint64(sessionId >> GAS_PRICE_LIMIT_BIT),
                            sessionId & FLAG_CANCELABLE != 0
                        )
                    )
                ));
                console.log("in batchMultiSigCall_ 5");
                if(uint16(sessionId >> RECURRENT_BIT) > 1 ){
                msg2 = bytes.concat(msg2, abi.encode(
                    mcalls.typeHash,
                    keccak256(
                        abi.encode(
                            BATCH_MULTI_SIG_CALL_RECURRENCY_TYPEHASH_,
                            uint16(sessionId >> RECURRENT_BIT),
                            uint32(sessionId >> CHILL_TIME_BIT),
                            sessionId & FLAG_CHILLMODE != 0
                        )
                    )
                ));
                }
                console.log("in batchMultiSigCall_ 6");
                if(uint8(sessionId >> EXT_SIGNERS_BIT) > 0 ){
                msg2 = bytes.concat(msg2, abi.encode(
                    mcalls.typeHash,
                    keccak256(
                        abi.encode(
                            BATCH_MULTI_SIG_CALL_MULTISIG_TYPEHASH_,
                            mcalls.signatures,
                            uint8(sessionId >> EXT_SIGNERS_BIT)
                        )
                    )
                ));
                }
                console.log("in batchMultiSigCall_ 7");
                // _checkSessionIdLimits(i, sessionId, nonce, maxNonce);
                _checkSessionIdLimits(sessionId);
                // maxNonce = sessionId;
                console.log("in batchMultiSigCall_ 8");
                uint256 length = mcalls.mcall.length;
                for (uint256 j = 0; j < length; ++j) {
                    console.log("in batchMultiSigCall_ 9");
                    MSCall calldata call = mcalls.mcall[j];
                    //console.log("loop :", j);
                   console.logBytes(call.types.length > 0 ? abiToEIP712(call.data, call.types, call.typedHashes, Offset({ data: 0, types: 0})) : call.data);
                    // if(call.types.length > 0){
                    //     bytes memory res;
                    //     (res,) = abiToEIP712(call.data, call.types, call.typedHashs, 0, 0);
                    //     console.logBytes(res);
                    // }
                    // else{
                    //     console.logBytes(call.data);
                    // }
                    console.log("in batchMultiSigCall_ 10");
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
                                    call.types.length > 0 ? abiToEIP712(call.data, call.types, call.typedHashes, Offset({ data: 0, types: 0})) : call.data
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
                    console.log("in batchMultiSigCall_ 11");
                }

                bytes32 messageHash = IFCT_Controller(msg.sender).register(
                    batchMultiSigCallID,
                    keccak256(msg2),
                    Meta({
                        amount: 1,
                        chillmode: 0,
                        chilltime: 0,
                        timestamp: 0, 
                        eip712: (sessionId & FLAG_EIP712) != 0
                    })
                );
                console.log("in batchMultiSigCall_ 12");
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
                console.log("in batchMultiSigCall_ 13");
                //TODO: multi-sig m of n - uncomment following lines
                if (uint8(sessionId >> EXT_SIGNERS_BIT) > 0) {
                    uint256 externalSigs = 0;
                    for (uint256 s = 0; s < signers.length; ++s) {
                        address signer = signers[s];
                        for (uint256 m = 0; m < mcalls.externalSigners.length; ++m) {
                            if (signer == mcalls.externalSigners[m]) {
                                ++externalSigs;
                                break;
                            }                        
                        }
                        if (externalSigs == uint8(sessionId >> EXT_SIGNERS_BIT)) {
                            break;
                        }
                    }
                    //require(externalSigs ==uint8(sessionId >> EXT_SIGNERS_BIT), "FCT: missing ext singatues");
                }
                console.log("in batchMultiSigCall_ 14");
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
                console.log("in batchMultiSigCall_ 15");
                locals.returnedValues = new bytes[](length);
                //console.log("gas until j:", locals.gas);
                for (uint256 j = 0; j < length; ++j) {
                    console.log(
                        "------------------ FTC %s ------------------",
                        j + 1
                    );
                    //console.log("test1");
                    uint256 gas = gasleft();

                    MSCall calldata call = mcalls.mcall[j];

                    if (call.to == address(0)) {
                        continue;
                    }
                    MultiSigInternalCallLocals memory varLocals;
                    varLocals.callFrom = _replace(call.from, mcalls.variables, j, locals.returnedValues);
                    if (varLocals.callFrom != call.from) {
                        for (uint256 l = 0; l < length; ++l) {
                            require(varLocals.callFrom != mcalls.mcall[l].from, "FCT: from exists");
                        }
                    }
                    console.log("in batchMultiSigCall_ 15.1");
                    // require(
                    //     IFCT_Runner(varLocals.callFrom).allowedToExecute_(
                    //         signers,
                    //         uint256(uint24(sessionId >> VERSION_BIT))
                    //     ) > 0,
                    //     "FCT: signers not allowed"
                    // );
                    console.log("in batchMultiSigCall_ 15.2");
                    // call.to
                    varLocals.callTo = _replace(call.to, mcalls.variables, j, locals.returnedValues);
                    // call.value
                    varLocals.value = _replace(call.value, mcalls.variables, j, locals.returnedValues);
                    // call.data
                    varLocals.data = call.data;
                    console.log("in batchMultiSigCall_ 16");
                    if (call.data.length > 0) {
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
                                            mcalls.variables.length,
                                        "FCT: var out of bound"
                                    );
                                    varLocals.varValue = mcalls.variables[
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
                    console.log("in batchMultiSigCall_ 17");
                    (bool success, bytes memory res) = _executeCall(
                        varLocals.callFrom, // wallet.addr,
                        IFCT_Controller(msg.sender).ensToAddress(call.ensHash, varLocals.callTo),
                        call.flags,
                        call.gasLimit,
                        locals.messageHash,
                        call.functionSignature,
                        varLocals.value,
                        varLocals.data
                    );
                    console.log('execute done', success);
                    
                    if (success) {
                        if (res.length > 64) {
                            locals.returnedValues[j] = abi.decode(res, (bytes));
                        }
                    }
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
                                gas
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
                                gas
                            );
                            break;
                        }
                        revert(_getRevertMsg(res));
                    } else if (call.flags & FLAG_FLOW == OK_STOP_FAIL_CONT) {
                        locals.rt[locals.index][j] = gasDiff(
                            varLocals.callFrom, // wallet.addr,
                            gas
                        );
                        break;
                    } else if (call.flags & FLAG_FLOW == OK_REVERT_FAIL_CONT) {
                        revert("FCT: revert on success");
                    } else if (call.flags & FLAG_FLOW == OK_JUMP_FAIL_CONT) {
                        j = j + (call.flags & FLAG_JUMP);
                    }
                    locals.rt[locals.index][j] = gasDiff(
                        varLocals.callFrom, // wallet.addr,
                        gas
                    );
                }
            }
            // s_nonce_group[ng] = _nextNonce(nonce, maxNonce);
            emit BatchTransfered_(3, block.number, 0);
        }
    }

    function gasDiff(
        address wallet,
        uint256 gas
        // uint256 additionalGas
    ) internal view returns (MReturn memory) {
        //console.log("gasDiff: wallet: %s, gas: %s, additionalGas: %s", wallet, gas - gasleft() + additionalGas, additionalGas);
        return MReturn(wallet, uint88(gas - gasleft())); // + additionalGas));
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
