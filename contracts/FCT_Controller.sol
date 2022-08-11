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

    // TODO: timestamp | chilltime | chillmode | amount
    // TODO: in limits (amount, chilltime, chillmode)
    // TODO: header/meta with: builder-address
    // TODO: header/meta with: multisig array and number of signers
    // TODO: check usage of sessionid
    // TODO: events

    function register(bytes32 id, bytes32 dataHash, Meta calldata meta) external returns (bytes32 messageHash) {
        require(s_targets[id] == msg.sender, "FCT: not a version");
        messageHash = _messageToRecover(dataHash, meta.eip712);
        Meta storage curMeta = s_fcts[messageHash];
        require(curMeta.amount != 1, "FCT: allready executed");
        if (curMeta.amount == 0) {
            s_fcts[messageHash] = Meta({
                timestamp: uint40(block.timestamp),
                chilltime: meta.chilltime,
                amount: meta.amount,
                eip712: meta.eip712,
                chillmode: meta.chillmode 
            });
        } else {
            require(block.timestamp - curMeta.timestamp > curMeta.chilltime, "FCT: too early");
            curMeta.amount = curMeta.amount - 1;
            if (curMeta.chillmode == 0) {
                curMeta.timestamp = uint40(block.timestamp);
            } else {
                 curMeta.timestamp = curMeta.timestamp + curMeta.chillmode;               
            }
        }
    }

    fallback() external {
        address target = s_targets[abi.decode(msg.data, (bytes32))];
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
        //console.log('target to version', target);
        //console.logBytes32(id);
        return IFCT_Engine(target).VERSION();
    }

    function addTarget(address target) external onlyOwner {
        require(target != address(0), "no target address");
        bytes32[] memory ids = IFCT_Engine(target).getIDs();        
        uint256 i;
        for (i=0; i<ids.length; i++) {          
          require(s_targets[ids[i]] == address(0), "target exists");
          //console.log('target added', target);
          //console.logBytes32(ids[i]);
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
            require(result == expectedAddress, "Factory: ens address mismatch");
        }
        require(result != address(0), "Factory: ens address not found");
    }

}
