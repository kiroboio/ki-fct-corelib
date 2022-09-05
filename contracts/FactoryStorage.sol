// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v1;
import "./lib/Proxy.sol";
import "./lib/ProxyLatest.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct Wallet {
    address addr;
    bool owner;
    uint88 debt;
}

struct UpgradeRequest {
    bytes8 version;
    uint256 validAt;
}

interface ENS {
    function resolver(bytes32 node) external view returns (Resolver);
}

interface Resolver {
    function addr(bytes32 node) external view returns (address);
}

/** @title FactoryStorage contract 
    @author Tal Asa <tal@kirobo.io> 
    @notice Factory contract - defines functions that are used by all related contracts
 */
abstract contract FactoryStorage is Ownable {
    using SignatureChecker for address;
    using ECDSA for bytes32;

    address internal s_target;

    Proxy internal s_swProxy;

    ProxyLatest internal s_swProxyLatest;

    bytes8 public constant LATEST = bytes8("latest");

    mapping(address => Wallet) internal s_accounts_wallet;
    mapping(address => bytes8) internal s_wallets_version;
    mapping(address => UpgradeRequest) internal s_wallets_upgrade_requests;
    mapping(bytes8 => address) internal s_versions_code;

    bytes8 internal s_production_version;
    address internal s_production_version_code;

    address internal s_production_version_oracle;
    mapping(bytes8 => address) internal s_versions_oracle;
    address internal s_activator;
    mapping(uint256 => uint256) internal s_nonce_group;

    bytes32 public DOMAIN_SEPARATOR;
    uint256 public CHAIN_ID;

    bool public s_frozen;
    bytes32 internal s_uid;

    ENS internal s_ens;
    mapping(bytes32 => address) internal s_local_ens;

    address internal s_target_;
    bool public s_frozen_;

    mapping(bytes32 => uint256) internal s_fcts;

    uint256 internal constant FLAG_EIP712 = 0x0100;
    uint256 internal constant FLAG_STATICCALL = 0x0400;
    uint256 internal constant FLAG_CANCELABLE = 0x0800;
    uint256 internal constant FLAG_PAYMENT = 0xf000;

    uint256 internal constant FLAG_FLOW = 0x00f0;
    uint256 internal constant FLAG_JUMP = 0x000f;

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

    // uint256 internal constant OK_REVERT_FAIL_CONT = 0x0020;

    // uint256 internal constant ON_FAIL_STOP = 0x01;
    // uint256 internal constant ON_FAIL_CONTINUE = 0x02;
    // uint256 internal constant ON_SUCCESS_STOP = 0x10;
    // uint256 internal constant ON_SUCCESS_REVERT = 0x20;

    /* uint16 internal constant FLAG_EIP712 = 0x0100;
    uint16 internal constant FLAG_STATICCALL = 0x0400;
    uint16 internal constant FLAG_CANCELABLE = 0x0800;
    uint16 internal constant FLAG_PAYMENT = 0xf000;
    uint16 internal constant FLAG_FLOW = 0x00ff;

    uint16 internal constant ON_FAIL_STOP = 0x01;
    uint16 internal constant ON_FAIL_CONTINUE = 0x02;
    uint16 internal constant ON_SUCCESS_STOP = 0x10;
    uint16 internal constant ON_SUCCESS_REVERT = 0x20; */

    constructor() {
        s_swProxy = new Proxy();
        s_swProxyLatest = new ProxyLatest();
        s_versions_code[LATEST] = address(s_swProxyLatest);
    }

    function _resolve(bytes32 node) internal view returns (address result) {
        require(address(s_ens) != address(0), "Factory: ens not defined");
        Resolver resolver = s_ens.resolver(node);
        require(address(resolver) != address(0), "Factory: resolver not found");
        result = resolver.addr(node);
        require(result != address(0), "Factory: ens address not found");
    }

    function _ensToAddress(bytes32 ensHash, address expectedAddress)
        internal
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
            require(result == expectedAddress, "Factory: ens address mismatch");
        }
        require(result != address(0), "Factory: ens address not found");
    }

    function _getWalletFromMessage(
        address signer,
        bytes32 messageHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal view returns (Wallet storage) {
        if (signer == address(0)) {
            return s_accounts_wallet[messageHash.recover(v, r, s)];
        } else if (
            signer.isValidSignatureNow(
                messageHash,
                v != 0 ? abi.encodePacked(r, s, v) : abi.encodePacked(r, s)
            )
        ) {
            return s_accounts_wallet[signer];
        }
        revert("Factory: wrong signer");
    }

    function _addressFromMessageAndSignature(
        bytes32 messageHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal pure returns (address) {
        if (v != 0) {
            return messageHash.recover(v, r, s);
        }
        return
            messageHash.recover(
                27 + uint8(uint256(s) >> 255),
                r,
                s &
                    0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
            );
    }

    function _getRevertMsg(bytes memory returnData)
        internal
        pure
        returns (string memory)
    {
        if (returnData.length < 68)
            return "Wallet: Transaction reverted silently";

        assembly {
            returnData := add(returnData, 0x04)
        }
        return abi.decode(returnData, (string));
    }

    function _messageToRecover(bytes32 hashedUnsignedMessage, bool eip712)
        internal
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
}
