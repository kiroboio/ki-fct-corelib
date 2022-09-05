// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IFCT_Controller.sol";

interface ENS {
    function resolver(bytes32 node) external view returns (Resolver);
}

interface Resolver {
    function addr(bytes32 node) external view returns (address);
}

/** @title FCT_Storage contract 
    @author Tal Asa <tal@kirobo.io> 
    @notice FCT_Storage - defines functions that are used by all related contracts
 */
abstract contract FCT_Storage is Ownable, IFCT_Controller {
    using SignatureChecker for address;
    using ECDSA for bytes32;

    mapping(bytes32 => address) s_targets;

    address internal s_activator;
    mapping(uint256 => uint256) internal s_nonce_group;

    bytes32 public DOMAIN_SEPARATOR;
    uint256 public CHAIN_ID;

    bytes32 internal s_uid;

    ENS internal s_ens;
    mapping(bytes32 => address) internal s_local_ens;

    mapping(bytes32 => Meta) internal s_fcts;

    constructor() {}

    function _resolve(bytes32 node) internal view returns (address result) {
        require(address(s_ens) != address(0), "Factory: ens not defined");
        Resolver resolver = s_ens.resolver(node);
        require(address(resolver) != address(0), "Factory: resolver not found");
        result = resolver.addr(node);
        require(result != address(0), "Factory: ens address not found");
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
