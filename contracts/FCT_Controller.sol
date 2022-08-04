// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import "./FCT_Storage.sol";
import "./interfaces/IFCT_Engine.sol";
import "hardhat/console.sol";

contract FCT_Controller is FCT_Storage {
    uint8 public constant VERSION_NUMBER = 0x1;
    string public constant NAME = "FCT Controller";
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

    // function execute(bytes32 id, address dest, bytes calldata data) external returns (bool, bytes memory) {
    //     // console.log('execute --------------------->');
    //     // console.logBytes32(id);
    //     require(s_targets[id] == msg.sender, "FCT: not a version");
    //     // console.logBytes(data);
    //     (bool success, bytes memory res) = dest.call(data);
    //     // console.log("res", res.length);
    //     // console.logBytes(res);
    //     if (success && res.length >= 64) {
    //         // console.logBytes(abi.decode(res, (bytes)));
    //         return (success, abi.decode(res, (bytes)));
    //     }
    //     return (success, res);
    //     // console.log('execute end --------------------->', success);
    // }

    function register(bytes32 id, bytes32 dataHash, bool eip712) external returns (bytes32 messageHash) {
        // console.log("register ------------------->");
        require(s_targets[id] == msg.sender, "FCT: not a version");
        messageHash = _messageToRecover(dataHash, eip712);
        // console.logBytes32(messageHash);
        require(s_fcts[messageHash] == 0, "FCT: allready executed");
        s_fcts[messageHash] = 1;
    }

    fallback() external {
        bytes32 id = abi.decode(msg.data, (bytes32));
        address target = s_targets[abi.decode(msg.data, (bytes32))];
        // console.log('---------> target from fallback', target);
        // console.logBytes32(id);
        require(target != address(0), "FCT: target not found");
        assembly {
            calldatacopy(0x00, 0x00, calldatasize())
            let res := call(
                gas(),
                target,
                0,
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

    function version(bytes32 id) external view returns (bytes4) {
        address target  = s_targets[id];
        require(target != address(0), "FCT: target not found");
        console.log('target to version', target);
        console.logBytes32(id);
        return IFCT_Engine(target).VERSION();
    }

    function addTarget(address target) external onlyOwner {
        require(target != address(0), "no target address");
        bytes32[] memory ids = IFCT_Engine(target).getIDs();        
        uint256 i;
        for (i=0; i<ids.length; i++) {          
          require(s_targets[ids[i]] == address(0), "target exists");
          console.log('target added', target);
          console.logBytes32(ids[i]);
          s_targets[ids[i]] = target;
        }
    }

    function funcAddress(bytes32 funcID) external view returns (address) {
      return s_targets[funcID];
    }

    function setActivator(address newActivator) external onlyOwner {
        s_activator = newActivator;
    }

    function uid() external view returns (bytes32) {
        return s_uid;
    }

    function activator() external view returns (address) {
        return s_activator;
    }

    function setLocalEns(string calldata ens, address dest) external onlyOwner {
        s_local_ens[keccak256(abi.encodePacked("@", ens))] = dest;
    }

}
