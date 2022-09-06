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

    // TODO: events
    // TODO: packed version for fct info

    /**@notice this function deletes an FCT from the blockchain in order to save gas
     * @param id - a bytes 32 param that states the specific batchMultiSigCall that was selected
        * abi.encodePacked(bytes4(FCT_BatchMultiSig.batchMultiSigCall.selector),VERSION,bytes24(0x0)) 
     * @param messageHashes - an array of FCT's ready to be purged
     */
    function purge(bytes32 id, bytes32[] calldata messageHashes) external {
        require(s_targets[id] == msg.sender, "FCT: not a version");
        for (uint256 i=0; i<messageHashes.length; i++) {
          Meta storage meta = s_fcts[messageHashes[i]];
          if (meta.purgeable && meta.expiresAt < block.timestamp) {
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
    function register(bytes32 id, bytes32 dataHash, MetaInput calldata meta) external returns (bytes32 messageHash) {
        require(s_targets[id] == msg.sender, "FCT: not a version");
        messageHash = _messageToRecover(dataHash, meta.eip712);
        Meta storage curMeta = s_fcts[messageHash];
        require(curMeta.amount != 1, "FCT: allready executed");
        if (curMeta.amount == 0) {
            s_fcts[messageHash] = Meta({
                expiresAt: uint40(meta.expiresAt),
                starttime: uint40(block.timestamp),
                lasttime: uint40(block.timestamp),
                timestamp: uint40(block.timestamp),
                chilltime: meta.chilltime,
                amount: meta.startamount == 0 ? 1 : meta.startamount,
                startamount: meta.startamount == 0 ? 1 : meta.startamount,
                eip712: meta.eip712,
                accumatable: meta.accumatable,
                purgeable: meta.purgeable,
                cancelable: meta.cancelable
            });
        } else {
            require(block.timestamp - curMeta.timestamp > curMeta.chilltime, "FCT: too early");
            curMeta.amount = curMeta.amount - 1;
            if (curMeta.accumatable) {
              curMeta.timestamp = curMeta.timestamp + curMeta.chilltime;
            } else {
              curMeta.timestamp = uint40(block.timestamp);
            }
            curMeta.lasttime = uint40(block.timestamp);
        }
    }

    /**@notice this is the function that is called when an activator activates the FCT an runs the transaction inside it
     * the msg.data contains all the FCT call data 
     */
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

    /**@notice returns the version of the FCT call according to the input callId
     * @param id - a bytes 32 param that states the specific batchMultiSigCall that was selected
     * @return bytes3 - that contains the version
     */
    function version(bytes32 id) external view returns (bytes3) {
        address target  = s_targets[id];
        require(target != address(0), "FCT: target not found");
        //console.log('target to version', target);
        //console.logBytes32(id);
        return IFCT_Engine(target).VERSION();
    }

    /**@notice in case we want to create a new version of a specific function we can add a target using this function
     * @param target address of the new target
     */
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

    function fctInfo(bytes32 messageHash) external view returns (Meta memory) {
      return s_fcts[messageHash];
    }

    // TODO: tight packed with << >> 
    // function fctInfoPacked(bytes32 messageHash) external view returns (uint256) {
    //   return abi.decode(abi.encodePacked(s_fcts[messageHash]), (uint256));
    // }

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
