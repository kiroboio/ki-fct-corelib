// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v1;

import "./FCT_Storage.sol";

abstract contract FCT_Engine is FCT_Storage {
    uint8 public constant VERSION_NUMBER = 0x1;
    string public constant NAME = "FCT Engine";
    string public constant VERSION = "1";

    constructor(ENS ens) FCT_Storage() {
        s_ens = ens;

        uint256 chainId;
        assembly {
            chainId := chainid()
        }

        s_uid = bytes32(
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
                s_uid
            )
        );
    }

    fallback() external {
        address target = s_targets[abi.decode(msg.data, (bytes32))];
        require(target != address(0), "FCT: target not found");

        assembly {
            calldatacopy(0x00, 0x00, calldatasize())
            let res := delegatecall(
                gas(),
                mload(target),
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

    function addTarget(address target) external onlyOwner {
        require(target != address(0), "no target");
        //TODO: get id from target interface
        bytes32 id = 0x0;
        s_targets[id] = target;
    }

    function setActivator(address newActivator) external onlyOwner {
        s_activator = newActivator;
    }

    function setLocalEns(string calldata ens, address dest) external onlyOwner {
        s_local_ens[keccak256(abi.encodePacked("@", ens))] = dest;
    }
}
