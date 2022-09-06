// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

/** @notice this contract holds the main functionality of creating an FCT
 * (future conditional transaction), it will recieve transactions
 *  in a specific format as inputs and will reconstract them into the FCT itself,
 *  it will build a signed msg from the readable format that the user signed on
 *  using parameters (optional), multiSig (optional) ect.. 
*/

// TODO: protection for payer (by calling vault for approve in activators)
// TODO: always revert if signatures do not match (do flow if call fails)
// DONE: protection for running the same version with different impl (adding func-sig to version in eip712)
// TODO: return payees to activators
// TODO: wallet: useStrictVersioning, isUsingStrictVersioning
// TODO: events
// DONE: change localCall_, localStaticCall to fctCall fctStaticCall, etc.

import "./FCT_Constants.sol";
import "./interfaces/IFCT_Engine.sol";
import "./interfaces/IFCT_Controller.sol";
import "./interfaces/IFCT_Runner.sol";
import "./FCT_Helpers.sol";
import "hardhat/console.sol";

/** @dev we used a parameter called sessionId to hold the following info: */
                                              // 1-7      8bit flags
uint256 constant GAS_PRICE_LIMIT_BIT = 8;  // 8-72     64bit gas price limit
uint256 constant AFTER_TS_BIT = 72;       // 72-112   40bit before timestamp
uint256 constant BEFORE_TS_BIT = 112;       // 112-152  40bit after timestamp
uint256 constant CHILL_TIME_BIT = 152;     // 152-184  32bit gas limit
uint256 constant RECURRENT_BIT = 184;      // 184-200  16bit nonce
uint256 constant VERSION_BIT = 200;        // 184-224  24bit nonce
uint256 constant EXT_SIGNERS_BIT = 224;       // 224-232  8bit nonce
uint256 constant SALT_BIT = 232;           // 232-256  24bit nonce

/** @dev we used a parameter called callId to hold the following info: */
                                            // 1-7      8bit flags
uint256 constant GAS_LIMIT_BIT = 8;         // 8-40     32bit gas limit
uint256 constant CALL_INDEX_BIT = 40;       // 40-56   16bit call index
uint256 constant PAYER_INDEX_BIT = 56;      // 56-72  16bit payer index
uint256 constant OK_JUMP_BIT = 72;          // 72-88  16bit jump on success
uint256 constant FAIL_JUMP_BIT = 88;        // 88-104  16bit jump on fail
uint256 constant FLOW_BIT = 104;            // 104-112  8bit flow
uint256 constant PERMISSIONS_BIT = 112;     // 112-128  16bit permissions

/**@dev the flags 8 bit shown above is also used as 
 * indevidual bits to hold the following flags: */
uint256 constant FLAG_ACCUMATABLE = 0x01;
uint256 constant FLAG_PURGEABLE = 0x02;
uint256 constant FLAG_CANCELABLE = 0x04;
uint256 constant FLAG_EIP712 = 0x08;

uint256 constant FLAG_STATICCALL = 0x01;

struct MultiSigCallLocals {
    bytes32 messageHash;
    uint256 gas;
    uint256 index;
    uint256 sessionId;
    uint16[] payerIndex;
    address[] callFromList;
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
    uint256 gasLimit;
    uint256 flow;
    address callPayer;
}

contract FCT_BatchMultiSig is IFCT_Engine, FCT_Helpers {
    bytes3 public constant VERSION = bytes3(0x010101);

    bytes32 public constant batchMultiSigCallID = bytes32(
        abi.encodePacked(
            FCT_BatchMultiSig.batchMultiSigCall.selector,
            VERSION,
            bytes24(0x0)
        )
    );

    uint256 public constant OK_CONT_FAIL_REVERT = 0x00;
    string public constant OK_CONT_FAIL_REVERT_MSG =
        "continue on success, revert on fail";
    bytes32 public constant OK_CONT_FAIL_REVERT_HASH =
        keccak256(abi.encodePacked(OK_CONT_FAIL_REVERT_MSG));

    uint256 public constant OK_CONT_FAIL_STOP = 0x01;
    string public constant OK_CONT_FAIL_STOP_MSG =
        "continue on success, stop on fail";
    bytes32 public constant OK_CONT_FAIL_STOP_HASH =
        keccak256(abi.encodePacked(OK_CONT_FAIL_STOP_MSG));

    uint256 public constant OK_CONT_FAIL_CONT = 0x02;
    string public constant OK_CONT_FAIL_CONT_MSG =
        "continue on success, continue on fail";
    bytes32 public constant OK_CONT_FAIL_CONT_HASH =
        keccak256(abi.encodePacked(OK_CONT_FAIL_CONT_MSG));

    uint256 public constant OK_REVERT_FAIL_CONT = 0x03;
    string public constant OK_REVERT_FAIL_CONT_MSG =
        "revert on success, continue on fail";
    bytes32 public constant OK_REVERT_FAIL_CONT_HASH =
        keccak256(abi.encodePacked(OK_REVERT_FAIL_CONT_MSG));

    uint256 public constant OK_REVERT_FAIL_STOP = 0x04;
    string public constant OK_REVERT_FAIL_STOP_MSG =
        "revert on success, stop on fail";
    bytes32 public constant OK_REVERT_FAIL_STOP_HASH =
        keccak256(abi.encodePacked(OK_REVERT_FAIL_STOP_MSG));

    uint256 public constant OK_STOP_FAIL_CONT = 0x05;
    string public constant OK_STOP_FAIL_CONT_MSG =
        "stop on success, continue on fail";
    bytes32 public constant OK_STOP_FAIL_CONT_HASH =
        keccak256(abi.encodePacked(OK_STOP_FAIL_CONT_MSG));

    uint256 public constant OK_STOP_FAIL_REVERT = 0x06;
    string public constant OK_STOP_FAIL_REVERT_MSG =
        "stop on success, revert on fail";
    bytes32 public constant OK_STOP_FAIL_REVERT_HASH =
        keccak256(abi.encodePacked(OK_STOP_FAIL_REVERT_MSG));

   // Stubs: Taken from FactoryProxy
    uint8 public constant VERSION_NUMBER = 0x0;
    string public constant NAME = "";

    /**@notice this function replaces input address parameters to the real address in run time
     * @param addr - input param location to be replaced i.e : 0xFC00...1 -> var 1 in variable array
     * @param variables - array of values to be replaced with the input params
     * @param trxNum - in case of a parameter that is used as return value (0xFD000..x) from prev transaction, 
     *                  we need to make sure that the trx being used is a prev one
     * @param returnedValues - holds the returned values from prev transactions
     * @return address to be replaced from the input parameter
    */
    function _replace(address addr, bytes32[] calldata variables, uint256 trxNum, bytes[] memory returnedValues) 
    private pure returns (address) {
        uint256 value = uint256(uint160(addr));
        //0xFC000...xx
        if (value > VAR_MIN && value < VAR_MAX) {
            require(value & VAR_MASK <= variables.length, "FCT: var out of bound");
            return address(uint160(uint256(variables[(value & VAR_MASK) - 1])));
        }
        //0xFD000...xx
        if (value > RET_MIN && value < RET_MAX) {
            require((value & VAR_MASK) <= trxNum, "FCT: tx out of bound");
            bytes memory data = returnedValues[(value & VAR_MASK) - 1];
            uint256 innerPos = value < RET_REV 
                            ? ((value & RET_MASK) + 1) * 32 
                            : data.length - ((value & RET_MASK) + 1) * 32;
            require(innerPos < data.length, "FCT: inner out of bound");
            assembly { mstore( addr, mload(add(data, innerPos))) }
        }
        return addr;
    }

    /**@notice this function replaces input value parameters to the real value in run time
     * @param value - input param location to be replaced i.e : 0xFC00...1 -> var 1 in variable array
     * @param variables - array of values to be replaced with the input params
     * @param trxNum - in case of a parameter that is used as return value (0xFD000..x) from prev transaction, 
     *                  we need to make sure that the trx being used is a prev one
     * @param returnedValues - holds the returned values from prev transactions
     * @return uint256 to be replaced from the input parameter
    */
    function _replace(uint256 value, bytes32[] calldata variables, uint256 trxNum, bytes[] memory returnedValues) 
    private pure returns (uint256) {
        if ((value > VAR_MIN && value < VAR_MAX) || (value > VARX_MIN && value < VARX_MAX)) {
            require(value & VAR_MASK <= variables.length, "FCT: var out of bound");
            return uint256(variables[(value & VAR_MASK) - 1]);
        }
        if ((value > RET_MIN && value < RET_MAX) || (value > RETX_MIN && value < RETX_MAX)) {
            require((value & VAR_MASK) <= trxNum, "FCT: tx out of bound");
            bytes memory data = returnedValues[(value & VAR_MASK) - 1];
            uint256 innerPos = (value < RET_REV || (value > RETX_MIN && value < RETX_REV)) 
                            ? ((value & RET_MASK) + 1) * 32 
                            : data.length - ((value & RET_MASK) + 1) * 32;
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
    bytes32 public constant BATCH_MULTI_SIG_CALL_FCT_TYPEHASH_ =
        keccak256(
            "FCT(string name,bytes4 selector,bytes3 version,bytes3 random_id,bool eip712)"
        );

    bytes32 public constant BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH_ =
        keccak256(
            "Limits(uint40 valid_from,uint40 expires_at,uint64 gas_price_limit,bool purgeable,bool cancelable)"
        );

    bytes32 public constant BATCH_MULTI_SIG_CALL_RECURRENCY_TYPEHASH_ =
        keccak256(
            "Recurrency(uint16 max_repeats,uint32 chill_time,bool accumetable)"
        );

    bytes32 public constant BATCH_MULTI_SIG_CALL_MULTISIG_TYPEHASH_ =
        keccak256(
            "Multisig(address[] external_signers,uint8 minimum_approvals)"
        );

    bytes32 public constant BATCH_MULTI_SIG_CALL_TRANSACTION_TYPEHASH_ =
        keccak256(
            "Transaction(uint16 call_index,uint16 payer_index,address from,address to,string to_ens,uint256 eth_value,uint32 gas_limit,bool view_only,uint16 permissions,string flow_control,uint16 jump_on_success,uint16 jump_on_fail,string method_interface)"
        );

   event BatchMultiSigCallFailed(
        address indexed wallet,
        uint256 nonce,
        uint256 index,
        uint256 innerIndex
    );
    event BatchMultiSigCallPackedFailed(
        address indexed wallet,
        uint256 nonce,
        uint256 index,
        uint256 innerIndex
    );
    event BatchTransfered(uint256 indexed mode, uint256 block, uint256 nonce);

    constructor() {}

    function getIDs() external pure returns (bytes32[] memory res) {
      res = new bytes32[](1);
      res[0] = batchMultiSigCallID;
    }

    uint256 constant TYPE_NATIVE = 1000;
    uint256 constant TYPE_STRING = 2000;
    uint256 constant TYPE_BYTES = 3000;
    uint256 constant TYPE_ARRAY = 4000;

     function _decodeString(bytes calldata data, uint256 index)
        private
        pure
        returns (string memory)
    {
        uint256 pos = abi.decode(data[(index) * 32:(index+1)* 32], (uint256));
        bytes memory strData = bytes.concat(abi.encode(0x20),data[pos:]);
        return abi.decode(strData, (string));
    }

    function _decodeBytes(bytes calldata data, uint256 index)
        private
        pure
        returns (bytes memory)
    {
        uint256 pos = abi.decode(data[(index) * 32:(index+1)* 32], (uint256));
        bytes memory strData = bytes.concat(abi.encode(0x20),data[pos:]);
        return abi.decode(strData, (bytes));
    }

    struct Offset {
        uint256 data;
        uint256 types;
    }

    struct Array {
        uint256 size;
        uint256 offset;
        uint256 typesOffset;
    }

    /**@notice  this function preduces the same result msg as the EIP712 standard
    * so, we can enable the user to sign a readble msg with all the params and then
    * using this function create the msg output as the EIP712 standart
    * @param data - bytes the abi data
    * @param types - array of types included in the msg
    * @param typedHashes - structs hashes (if there are structs in the inputs)
    * @param offset - struct that holds offsets for the data and types array
    * @return res - bytes af the result hashes of the input types
    */
    function abiToEIP712(bytes calldata data, uint256[] calldata types, bytes32[] calldata typedHashes, Offset memory offset)
        public
        view
        returns (bytes memory res)
    {
        for (uint256 i; i < types.length ; i++) {
            if (types[i] == TYPE_STRING) {
                string memory str = _decodeString(data, offset.data);
                bytes memory buff = abi.encodePacked(str);
                res = bytes.concat(res, keccak256(buff));
                offset.data = offset.data + 1;
            } else if (types[i] == TYPE_BYTES) {
                bytes memory bytesData = _decodeBytes(data, offset.data);
                res = bytes.concat(res, keccak256(bytesData));
                offset.data = offset.data + 1;
            } else if ( types[i] == TYPE_ARRAY){
                Array memory array;
                array.offset = abi.decode(data[offset.data*32:(offset.data+1)*32], (uint256));
                array.size = abi.decode(data[array.offset:array.offset+32], (uint256));
                array.offset = array.offset + 32;
                bytes memory arrayData;
                array.typesOffset = offset.types;
                    uint256[] calldata typesSubset = (types[i+1] < TYPE_NATIVE) 
                        ? types[i+1:i+2+types[i+1]] 
                        : types[i + 1 : i + 2];
                for (uint256 k=0; k < array.size; ++k) {
                    arrayData = bytes.concat(
                        arrayData,
                        abiToEIP712(data[array.offset:], 
                                    typesSubset, 
                                    typedHashes, 
                                    Offset({ data: k, types:array.typesOffset })
                    ));
                }

                res = bytes.concat(res, keccak256(arrayData));
                offset.data = offset.data + 1;
                offset.types = offset.types + 1;
                types[i+1] < TYPE_NATIVE ? i = i + types[i+1] + 1 : i = i + 1;
            } else if(types[i] < TYPE_NATIVE){
                uint256 numOfElements = types[i];
                uint256 structOffset = abi.decode(data[offset.data*32:(offset.data+1)*32], (uint256));
                bytes memory structData;
                structData = bytes.concat(structData, typedHashes[offset.types]);
                for (uint256 s=0; s < numOfElements; ++s) {
                    uint256 typesOffset = offset.types;
                    structData = bytes.concat(
                        structData,
                        abiToEIP712(data[structOffset:],
                        types[i + 1 + s : i + 2 + s],
                        typedHashes,
                        Offset({ data: s, types: typesOffset }))
                    );
                }

                res = bytes.concat(res, keccak256(structData));
                offset.data = offset.data + 1;
                offset.types = offset.types + 1;
                i = i + numOfElements ;
            } else {
                res = bytes.concat(res, data[offset.data * 32:(offset.data + 1) * 32]);
                offset.data = offset.data + 1;
            }
        }
    }

    // Batch Call: Multi Signature, Multi External Contract Functions
    /** @notice this function receives FCT array and runs the calls in the different FCT's
     * @param version - version of the specific batch function to run
     * @param tr - array of MSCalls which are equal to FCT's
     * @param purgeFCTs - FCT's that are ready to be purged (removed, and by that get gas back)
     * @return names - name of FCT, in order to keep track for builders
     * @return maxGasPrices - max gas price that was defined for each FCT
     *              used for calculation of costs for the users and refund for the activators
     * @return rt - a struct that hold info regarding who is the vault assosiatet with the call 
     *              used for calculation of costs for the users and refund for the activators 
     */
    function batchMultiSigCall(
        bytes3 version,
        MSCalls[] calldata tr,
        bytes32[] calldata purgeFCTs
    ) external returns (string[] memory names, uint256[] memory maxGasPrices, MReturn[][] memory rt) {
        require(version == VERSION, "fct: wrong version");
        uint256 trLength = tr.length;
        rt = new MReturn[][](trLength);
        names = new string[](trLength);
        maxGasPrices = new uint256[](trLength);
        /** @dev creating the msg hash from the msg itself by doing hash of every part of the msg 
        * and then a hash of all of them 
        */
        unchecked {
            for (uint256 i; i < trLength; ++i) {
                uint256 IGas = gasleft();
                MSCalls calldata mcalls = tr[i];
                names[i] = mcalls.name;
                uint256 sessionId = mcalls.sessionId;
                maxGasPrices[i] = uint64(sessionId >> GAS_PRICE_LIMIT_BIT);
                /** @dev hash of the Info part*/
                bytes memory msg2 = abi.encode(
                    mcalls.typeHash,
                    keccak256(
                        abi.encode(
                            BATCH_MULTI_SIG_CALL_FCT_TYPEHASH_,
                            keccak256(abi.encodePacked(mcalls.name)),
                            FCT_BatchMultiSig.batchMultiSigCall.selector,
                            bytes32(sessionId >> VERSION_BIT << 232),
                            bytes32(sessionId >> SALT_BIT << 232), //random_id
                            (sessionId & FLAG_EIP712) != 0
                        )
                    ));

                // console.logBytes(abi.encode(
                //             BATCH_MULTI_SIG_CALL_INFO_TYPEHASH_,
                //             keccak256(abi.encodePacked(mcalls.name)),
                //             bytes32(sessionId >> VERSION_BIT << 232),
                //             bytes32(sessionId >> SALT_BIT << 232), //random_id
                //             (sessionId & FLAG_EIP712) != 0
                //         ));
                /** @dev hash of the Limits part*/
                msg2 = bytes.concat(msg2, keccak256(
                        abi.encode(
                            BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH_,
                            uint40(sessionId >> AFTER_TS_BIT), // valid_from
                            uint40(sessionId >> BEFORE_TS_BIT),
                            uint64(sessionId >> GAS_PRICE_LIMIT_BIT),
                            (sessionId & FLAG_PURGEABLE) != 0,
                            (sessionId & FLAG_CANCELABLE) != 0
                        )
                ));
                // console.logBytes(abi.encode(
                //             BATCH_MULTI_SIG_CALL_LIMITS_TYPEHASH_,
                //             uint40(sessionId >> AFTER_TS_BIT), // valid_from
                //             uint40(sessionId >> BEFORE_TS_BIT),
                //             uint64(sessionId >> GAS_PRICE_LIMIT_BIT),
                //             (sessionId & FLAG_PURGEABLE) != 0,
                //             (sessionId & FLAG_CANCELABLE) != 0
                //         ));
                /** @dev hash of the Recurrent part (optional) */
                if(uint16(sessionId >> RECURRENT_BIT) > 1 ){
                    msg2 = bytes.concat(msg2, keccak256(
                            abi.encode(
                                BATCH_MULTI_SIG_CALL_RECURRENCY_TYPEHASH_,
                                uint16(sessionId >> RECURRENT_BIT),
                                uint32(sessionId >> CHILL_TIME_BIT),
                                (sessionId & FLAG_ACCUMATABLE) != 0
                            )
                    ));
                }
                /** @dev hash of the MultiSig part (optional) */
                if(uint8(sessionId >> EXT_SIGNERS_BIT) > 0 ){
                    msg2 = bytes.concat(msg2, keccak256(
                            abi.encode(
                                BATCH_MULTI_SIG_CALL_MULTISIG_TYPEHASH_,
                                keccak256(abi.encodePacked(mcalls.externalSigners)),
                                uint8(sessionId >> EXT_SIGNERS_BIT)
                            )
                    ));
                }

                
                /** @dev hash of the EIP712 part*/
                _checkSessionIdLimits(sessionId);
                uint256 length = mcalls.mcall.length;

                MultiSigCallLocals memory locals;
                locals.payerIndex = new uint16[](length);
                
                for (uint256 j; j < length; ++j) {
                    MSCall calldata call = mcalls.mcall[j];
                    require(uint16(call.callId >> CALL_INDEX_BIT) == j + 1, "FCT: wrong call index");
                    locals.payerIndex[j] = uint16(call.callId >> PAYER_INDEX_BIT);
                    msg2 = abi.encodePacked(
                        msg2,
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
                            : keccak256(
                                abi.encode(
                                    call.typeHash,
                                    _calcMultiSigTransactionHash(call)
                                )
                            )
                            
                    );
                }

                bytes32 messageHash = IFCT_Controller(msg.sender).register(
                    batchMultiSigCallID,
                    keccak256(msg2),
                    MetaInput({
                        startamount: uint16(sessionId >> RECURRENT_BIT),
                        accumatable: (sessionId & FLAG_ACCUMATABLE) != 0,
                        chilltime: uint32(sessionId >> CHILL_TIME_BIT),
                        eip712: (sessionId & FLAG_EIP712) != 0,
                        expiresAt: uint40(sessionId >> BEFORE_TS_BIT),
                        purgeable: (sessionId & FLAG_PURGEABLE) != 0,
                        cancelable: (sessionId & FLAG_CANCELABLE) != 0
                    })
                );

                /** @dev gets the signers from the signatures of the calls */
                address[] memory signers = new address[](
                    mcalls.signatures.length
                );
                for (uint256 s; s < mcalls.signatures.length; ++s) {
                    Signature calldata signature = mcalls.signatures[s];
                    signers[s] = _addressFromMessageAndSignature(
                        messageHash,
                        signature.v,
                        signature.r,
                        signature.s
                    );
                }
    
                /** external signers if multiSig is enabled */
                if (uint8(sessionId >> EXT_SIGNERS_BIT) > 0) {
                    uint256 externalSigs = uint8(sessionId >> EXT_SIGNERS_BIT);
                    uint256 externalSignersLength = mcalls.externalSigners.length;
                    require(externalSignersLength >= externalSigs, "FCT: wrong # approvals");
                    for (uint256 s; s < signers.length; ++s) {
                        address signer = signers[s];
                        for (uint256 m; m < externalSignersLength; ++m) {
                            if (signer == mcalls.externalSigners[m]) {
                                --externalSigs;
                                break;
                            }                        
                        }
                        if (externalSigs == 0) {
                            break;
                        }
                    }
                    require(externalSigs == 0, "FCT: missing ext singatues");
                }

                /**@notice this struct is to save gas and avoid stack too deep error */
                {
                    locals.sessionId = sessionId;
                    locals.index = i;
                    if (sessionId & FLAG_CANCELABLE != 0) {
                        locals.messageHash = messageHash;
                    }
                    locals.rt = rt;
                    locals.rt[locals.index] = new MReturn[](length);
                    locals.gas = IGas - gasleft();
                }
                locals.returnedValues = new bytes[](length);
                locals.callFromList = new address[](length);
                /**@dev goin over each call in the FCT */
                for (uint256 j; j < length; ++j) {
                    uint256 gas = gasleft();
                    MSCall calldata call = mcalls.mcall[j];
                    if (call.to == address(0)) {
                        continue;
                    }
                    /**@dev replacing params with realtime values */
                    MultiSigInternalCallLocals memory varLocals;
                    varLocals.callFrom = _replace(call.from, mcalls.variables, j, locals.returnedValues);
                    if (varLocals.callFrom != call.from) {
                        for (uint256 l; l < length; ++l) {
                            require(varLocals.callFrom != mcalls.mcall[l].from, "FCT: from exists");
                        }
                    }
                    locals.callFromList[j] = varLocals.callFrom;
                    varLocals.callTo = _replace(call.to, mcalls.variables, j, locals.returnedValues);
                    varLocals.value = _replace(call.value, mcalls.variables, j, locals.returnedValues);
                    varLocals.data = call.data;
                    varLocals.sessionId = sessionId;
                    varLocals.gasLimit = uint32(call.callId >> GAS_LIMIT_BIT);
                    varLocals.flow = uint8(call.callId >> FLOW_BIT);
                    varLocals.callPayer = locals.payerIndex[j] == 0 ? address(0) : mcalls.mcall[locals.payerIndex[j]-1].from; // locals.callFrom[locals.payerIndex[j]-1];

                    if (call.data.length > 0) {
                        for (
                            varLocals.dataIndex;
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

                                console.logBytes(locals.returnedValues[(varLocals.varId & VAR_MASK)-1]);
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

                    if ((sessionId & FLAG_CANCELABLE) != 0) {
                        messageHash = bytes32(0);
                    }

                    /** @dev runs the specific call */
                    (bool success, bytes memory res) = ((call.callId & FLAG_STATICCALL) > 0)
                            ? varLocals.callFrom.staticcall{
                                gas: varLocals.gasLimit == 0 || varLocals.gasLimit > gasleft()
                                    ? gasleft()
                                    : varLocals.gasLimit
                            }(
                                abi.encodeWithSignature(
                                    "fctStaticCall(bytes32,address,bytes,bytes32,address[],uint256,uint16)",
                                    batchMultiSigCallID,
                                    IFCT_Controller(msg.sender).ensToAddress(call.ensHash, varLocals.callTo),
                                    call.functionSignature ==
                                            0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
                                        ? bytes("")
                                        : abi.encodePacked(bytes4(call.functionSignature), varLocals.data),
                                    messageHash,
                                    signers,
                                    varLocals.sessionId,
                                    uint16(call.callId >> PERMISSIONS_BIT)
                                )
                            )
                            : varLocals.callFrom.call{
                                gas: varLocals.gasLimit == 0 || varLocals.gasLimit > gasleft()
                                    ? gasleft()
                                    : varLocals.gasLimit
                            }(
                                abi.encodeWithSignature(
                                    "fctCall(bytes32,address,uint256,bytes,bytes32,address[],uint256,uint16)",
                                    batchMultiSigCallID,
                                    IFCT_Controller(msg.sender).ensToAddress(call.ensHash, varLocals.callTo),
                                    varLocals.value,
                                    call.functionSignature ==
                                            0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
                                        ? bytes("")
                                        : abi.encodePacked(bytes4(call.functionSignature), varLocals.data),
                                    messageHash,
                                    signers,
                                    varLocals.sessionId,
                                    uint16(call.callId >> PERMISSIONS_BIT)
                                )
                            ); 
                                            
                        if (success) {
                            if (res.length > 64) {
                                locals.returnedValues[j] = abi.decode(res, (bytes));
                            }
                            if (varLocals.flow <= OK_CONT_FAIL_CONT) {
                                locals.rt[locals.index][j] = gasDiff(
                                    varLocals.callPayer, // wallet.addr,
                                    gas
                                );
                                j = j + uint16(call.callId >> OK_JUMP_BIT);
                                continue;
                            }
                            else if (varLocals.flow  >= OK_STOP_FAIL_CONT) {
                                locals.rt[locals.index][j] = gasDiff(
                                    varLocals.callPayer, // wallet.addr,
                                    gas
                                );
                                break;
                            } else if (varLocals.flow >= OK_REVERT_FAIL_CONT) {
                                revert("FCT: revert on success");
                            }
                            revert("FCT: unknown success flow");
                        }
                        else {
                            if (varLocals.flow == OK_CONT_FAIL_REVERT || varLocals.flow == OK_STOP_FAIL_REVERT) {
                                revert(_getRevertMsg(res));
                                // revert("FCT: revert on fail");
                            }
                            emit BatchMultiSigCallFailed(
                                varLocals.callFrom, // wallet.addr,
                                0,
                                locals.index,
                                j
                            );
                            if (
                                varLocals.flow == OK_CONT_FAIL_STOP || varLocals.flow == OK_REVERT_FAIL_STOP
                            ) {
                                locals.rt[locals.index][j] = gasDiff(
                                    varLocals.callPayer, // wallet.addr,
                                    gas
                                );
                                break;
                            } else if (varLocals.flow == OK_CONT_FAIL_CONT){
                                locals.rt[locals.index][j] = gasDiff(
                                    varLocals.callPayer, // wallet.addr,
                                    gas
                                );
                                j = j + uint16(call.callId >> FAIL_JUMP_BIT);
                                continue;
                            }
                            revert("FCT: unknown fail flow");
                        }
                }
                for (uint256 j; j < length; ++j) {
                    locals.rt[locals.index][j].vault = _replace(locals.rt[locals.index][j].vault, mcalls.variables, j, locals.returnedValues);
                }
            }

            if (purgeFCTs.length > 0) {
              IFCT_Controller(msg.sender).purge(batchMultiSigCallID, purgeFCTs);
            }
            emit BatchTransfered(3, block.number, 0);
        }
    }

    function gasDiff(
        address wallet,
        uint256 gas
    ) internal view returns (MReturn memory) {
        return MReturn(wallet, uint88(gas - gasleft()));
    }

/**@dev returns an Hash of the Transaction part of the FCT call
 * @param call - FCT call
 * @return bytes32 - hash of the transaction part of the call
 */
function _calcMultiSigTransactionHash(
        MSCall memory call
    ) private pure returns (bytes32) {
        uint256 callId = call.callId;
 
        return
            keccak256(
                abi.encode(
                    BATCH_MULTI_SIG_CALL_TRANSACTION_TYPEHASH_,
                    uint16(callId >> CALL_INDEX_BIT),
                    uint16(callId >> PAYER_INDEX_BIT),
                    call.from,
                    call.to,
                    call.ensHash,
                    call.value,
                    uint32(callId >> GAS_LIMIT_BIT),
                    call.callId & FLAG_STATICCALL > 0,
                    uint16(callId >> PERMISSIONS_BIT),
                    _getFlowHash(uint8(callId >> FLOW_BIT)),
                    uint16(callId >> OK_JUMP_BIT),
                    uint16(callId >> FAIL_JUMP_BIT),
                    call.functionSignature
                )
            );
    }

    /**@dev returns the flow nu,ber according to the flow hash input 
     * @param flowHash - input of the flow as a Hash
     * @return uint256 - flow number
    */
    function _getFlow(bytes32 flowHash) private pure returns (uint256) {
        if (flowHash == OK_CONT_FAIL_REVERT_HASH) {
            return OK_CONT_FAIL_REVERT;
        }
        if (flowHash == OK_CONT_FAIL_STOP_HASH) {
            return OK_CONT_FAIL_STOP;
        }
        if (flowHash == OK_CONT_FAIL_CONT_HASH) {
            return OK_CONT_FAIL_CONT;
        }
        if (flowHash == OK_REVERT_FAIL_CONT_HASH) {
            return OK_REVERT_FAIL_CONT;
        }
        if (flowHash == OK_REVERT_FAIL_STOP_HASH) {
            return OK_REVERT_FAIL_STOP;
        }
        if (flowHash == OK_STOP_FAIL_CONT_HASH) {
            return OK_STOP_FAIL_CONT;
        }
        if (flowHash == OK_STOP_FAIL_REVERT_HASH) {
            return OK_STOP_FAIL_REVERT;
        }
        return 0x0;
    }

    /**@dev returns a flow hash from the flow number input
     * @param flow - flow number
     * @return bytes32 - hash representing the flow
     */
    function _getFlowHash(uint256 flow) private pure returns (bytes32) {
        if (flow == OK_CONT_FAIL_REVERT) {
            return OK_CONT_FAIL_REVERT_HASH;
        }
        if (flow == OK_CONT_FAIL_STOP) {
            return OK_CONT_FAIL_STOP_HASH;
        }
        if (flow == OK_CONT_FAIL_CONT) {
            return OK_CONT_FAIL_CONT_HASH;
        }
        if (flow == OK_REVERT_FAIL_CONT) {
            return OK_REVERT_FAIL_CONT_HASH;
        }
        if (flow == OK_REVERT_FAIL_STOP) {
            return OK_REVERT_FAIL_STOP_HASH;
        }
        if (flow == OK_STOP_FAIL_CONT) {
            return OK_STOP_FAIL_CONT_HASH;
        }
        if (flow == OK_STOP_FAIL_REVERT) {
            return OK_STOP_FAIL_REVERT_HASH;
        }
        return 0x0;
    }

    function _checkSessionIdLimits(uint256 sessionId) private view {
        // console.log('session id', sessionId);
        // console.log('gas price', uint64(sessionId >> GAS_PRICE_LIMIT_BIT));
        // console.log('real gas price', tx.gasprice);
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
