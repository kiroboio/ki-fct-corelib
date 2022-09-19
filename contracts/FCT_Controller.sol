// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import "openzeppelin-solidity/contracts/utils/cryptography/SignatureChecker.sol";
import "openzeppelin-solidity/contracts/utils/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

import "./interfaces/IFCT_Engine.sol";

interface ENS {
    function resolver(bytes32 node) external view returns (Resolver);
}

interface Resolver {
    function addr(bytes32 node) external view returns (address);
}

contract FCT_Controller is Ownable, IFCT_Controller {
    using SignatureChecker for address;
    using ECDSA for bytes32;

    uint8 public constant VERSION_NUMBER = 0x1;
    string public constant NAME = "FCT Controller";
    string public constant VERSION = "1";

    uint256 public constant META_EIP712_FLAG = 0x1;
    uint256 public constant META_ACCUMATABLE_FLAG = 0x2;
    uint256 public constant META_PURGABLE_FLAG = 0x4;
    uint256 public constant META_BLOCKABLE_FLAG = 0x8;

    bytes32 public immutable DOMAIN_SEPARATOR;
    uint256 public immutable CHAIN_ID;
    bytes32 public immutable UID;

    address public s_actuator;
    address public s_ens;
    mapping(bytes32 => address) public s_local_ens;
    mapping(bytes32 => address) public s_targets;
    mapping(uint256 => uint256) public s_nonce_group;
    mapping(bytes32 => Meta) public s_fcts;

    event FCTE_Registered(
        bytes32 indexed id,
        bytes32 indexed messageHash,
        uint256 timestamp,
        uint256 meta
    );

    event FCTE_Purged(
        bytes32 indexed id,
        bytes32 indexed messageHash,
        uint256 timestamp,
        uint256 meta
    );

    event FCTE_TragetAdded(
        bytes32 indexed id,
        address indexed impl,
        uint256 timestamp
    );

    event FCTE_ActuatorChanged(
        address indexed actuator,
        address indexed prevActuator,
        uint256 timestamp
    );

    event FCTE_LocalENSChanged(
        bytes32 indexed ensHash,
        address indexed dest,
        address indexed prevDest,
        uint256 timestamp,
        string ens
    );

    event FCTE_ENSChanged(
        address indexed ens,
        address indexed prevEns,
        uint256 timestamp
    );

    constructor() {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }

        UID = bytes32(
            (uint256(VERSION_NUMBER) << 248) |
                ((uint256(blockhash(block.number - 1)) << 192) >> 16) |
                uint256(uint160(address(this)))
        );

        CHAIN_ID = chainId;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)"
                ),
                keccak256(bytes(NAME)),
                keccak256(bytes(VERSION)),
                chainId,
                address(this),
                UID
            )
        );
    }

    /**@notice this is the function that is called when an activator activates the FCT an runs the transaction inside it
     * the msg.data contains all the FCT call data
     */
    //   selector  version reserved (bytes17)                 nonce (64 bit)   not used
    // 0xffffffff  ffffff  0000000000000000000000000000000000 0000000000000000 00000000
    // 0xffffffff  ffffff  ffffffffffffffffffffffffffffffffff 0000000000000000 (id mask)
    // 0xffffffff  ff0000  ffffffffffff0000000000000000000000 0000000000000000 (nonce id mask)
    // 0x00000000  000000  0000000000000000000000000000000000 ffffffffffffffff (nonce mask)
    fallback() external {
        require(msg.sender == s_actuator, "FCT:C not an actuator");
        address target = s_targets[
            abi.decode(msg.data, (bytes32)) &
                bytes32(
                    0xffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000
                )
        ];
        require(target != address(0), "FCT:C target not found");
        assembly {
            calldatacopy(0x00, 0x00, calldatasize())
            let res := call(gas(), target, 0, 0x00, calldatasize(), 0, 0)
            returndatacopy(0x00, 0x00, returndatasize())
            if res {
                return(0x00, returndatasize())
            }
            revert(0x00, returndatasize())
        }
    }

    /**@notice this function deletes an FCT from the blockchain in order to save gas
     * @param id - a bytes 32 param that states the specific batchMultiSigCall that was selected
     * abi.encodePacked(bytes4(FCT_BatchMultiSig.batchMultiSigCall.selector),VERSION,bytes24(0x0))
     * @param messageHashes - an array of FCT's ready to be purged
     */
    function purge(bytes32 id, bytes32[] calldata messageHashes) external {
        require(s_targets[id] == msg.sender, "FCT:C not a version");
        for (uint256 i = 0; i < messageHashes.length; i++) {
            Meta storage meta = s_fcts[messageHashes[i]];
            if (
                (meta.flags & META_PURGABLE_FLAG) > 0 &&
                meta.expiresAt < block.timestamp
            ) {
                uint256 fct = abi.decode(abi.encode(meta), (uint256));
                emit FCTE_Purged(id, messageHashes[i], block.timestamp, fct);
                delete s_fcts[messageHashes[i]];
            }
        }
    }

    /**@notice this function registers the FCT in order to keep track of them
     * @param id - a bytes 32 param that states the specific batchMultiSigCall that was selected
     * @param dataHash - a hash of all the data of the FCT
     * @param meta - struct that contains the flags in the FCT
     * @return messageHash - a hash of the msg
     */
    function register(
        bytes32 id,
        bytes32 dataHash,
        MetaInput calldata meta
    ) external returns (bytes32 messageHash) {
        require(s_targets[id] == msg.sender, "FCT:C not a version");
        messageHash = _messageToRecover(dataHash, meta.eip712);
        Meta storage curMeta = s_fcts[messageHash];
        require(curMeta.amount != 1, "FCT:C allready executed");
        if (curMeta.amount == 0) {
            s_fcts[messageHash] = Meta({
                expiresAt: meta.expiresAt,
                starttime: uint40(block.timestamp),
                lasttime: uint40(block.timestamp),
                timestamp: uint40(block.timestamp),
                chilltime: meta.chilltime,
                amount: meta.startamount == 0 ? uint16(1) : meta.startamount,
                startamount: meta.startamount == 0
                    ? uint16(1)
                    : meta.startamount,
                flags: uint8(
                    (meta.eip712 ? META_EIP712_FLAG : 0) +
                        (meta.accumatable ? META_ACCUMATABLE_FLAG : 0) +
                        (meta.purgeable ? META_PURGABLE_FLAG : 0) +
                        (meta.blockable ? META_BLOCKABLE_FLAG : 0)
                ),
                reserved: meta.reserved
            });
        } else {
            require(
                block.timestamp - curMeta.timestamp > curMeta.chilltime,
                "FCT: too early"
            );
            curMeta.amount = curMeta.amount - 1;
            if (curMeta.flags & META_ACCUMATABLE_FLAG > 0) {
                curMeta.timestamp = curMeta.timestamp + curMeta.chilltime;
            } else {
                curMeta.timestamp = uint40(block.timestamp);
            }
            curMeta.lasttime = uint40(block.timestamp);
        }
        // uint256 fct =
        //         uint256(curMeta.flags) +
        //         (uint256(curMeta.expiresAt) << META_EXPIRES_AT_BIT) +
        //         (uint256(curMeta.lasttime) << META_LAST_TIME_BIT) +
        //         (uint256(curMeta.timestamp) << META_TIMESTAMP_BIT) +
        //         (uint256(curMeta.chilltime) << META_CHILL_TIME_BIT) +
        //         (uint256(curMeta.amount) << META_AMOUNT_BIT) +
        //         (uint256(curMeta.startamount) << META_START_AMOUNT_BIT) +
        //         (uint256(curMeta.reserved) << META_RESERVED_BIT)
        // ;
        emit FCTE_Registered(id, messageHash, block.timestamp, abi.decode(abi.encode(curMeta), (uint256)));
    }

    /**@notice in case we want to create a new version of a specific function we can add a target using this function
     * @param target address of the new target
     */
    function addTarget(address target) external onlyOwner {
        require(target != address(0), "FCT:C no target address");
        bytes32[] memory ids = IFCT_Engine(target).getIDs();
        uint256 i;
        for (i = 0; i < ids.length; i++) {
            bytes32 id = ids[i];
            require(s_targets[id] == address(0), "FCT:C target exists");
            s_targets[id] = target;
            emit FCTE_TragetAdded(id, target, block.timestamp);
        }
    }

    function setActuator(address newActuator) external onlyOwner {
        address prevActuator = s_actuator;
        s_actuator = newActuator;
        emit FCTE_ActuatorChanged(newActuator, prevActuator, block.timestamp);
    }

    function setLocalEns(string calldata ens, address dest) external onlyOwner {
        bytes32 ensHash = keccak256(abi.encodePacked("@", ens));
        address prevDest = s_local_ens[ensHash];
        if (dest != address(0)) {
            s_local_ens[ensHash] = dest;
        } else {
            delete s_local_ens[ensHash];
        }
        emit FCTE_LocalENSChanged(
            ensHash,
            dest,
            prevDest,
            block.timestamp,
            ens
        );
    }

    function setEns(address ens) external onlyOwner {
        emit FCTE_ENSChanged(ens, s_ens, block.timestamp);
        s_ens = ens;
    }

    /**@notice returns the version of the FCT call according to the input callId
     * @param id - a bytes 32 param that states the specific batchMultiSigCall that was selected
     * @return bytes3 - that contains the version
     */
    function version(bytes32 id) external view returns (bytes3) {
        address target = s_targets[id];
        require(target != address(0), "FCT:C target not found");
        return IFCT_Engine(target).VERSION();
    }

    function fctMetaPacked(bytes32 messageHash)
        public
        view
        returns (uint256)
    {
        return abi.decode(abi.encode(s_fcts[messageHash]), (uint256));
    }

    function ensToAddress(bytes32 ensHash, address expectedAddress)
        external
        view
        returns (address result)
    {
        if (
            ensHash ==
            0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470 ||
            ensHash == bytes32(0)
        ) {
            return expectedAddress;
        }
        result = s_local_ens[ensHash];
        if (result == address(0)) {
            result = _resolve(ensHash);
        }
        if (expectedAddress != address(0)) {
            require(result == expectedAddress, "FCT:C ens address mismatch");
        }
        require(result != address(0), "FCT:C ens address not found");
    }

    function _resolve(bytes32 node) private view returns (address result) {
        require(s_ens != address(0), "FCT:C ens not defined");
        Resolver resolver = ENS(s_ens).resolver(node);
        require(address(resolver) != address(0), "FCT:C resolver not found");
        result = resolver.addr(node);
        require(result != address(0), "FCT:C ens not found");
    }

    function _messageToRecover(bytes32 hashedUnsignedMessage, bool eip712)
        private
        view
        returns (bytes32)
    {
        if (eip712) {
            return
                keccak256(
                    abi.encodePacked(
                        "\x19\x01",
                        DOMAIN_SEPARATOR,
                        hashedUnsignedMessage
                    )
                );
        }
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n64",
                    DOMAIN_SEPARATOR,
                    hashedUnsignedMessage
                )
            );
    }

    //TODO: remove uid()
    function uid() external view returns (bytes32) {
        return UID;
    }

}
