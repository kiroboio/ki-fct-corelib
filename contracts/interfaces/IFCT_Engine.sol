// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "../interfaces/IFCT_Controller.sol";

struct Signature {
    bytes32 r;
    bytes32 s;
    uint8 v;
}

struct MSCall {
    bytes32 typeHash;
    bytes32 ensHash;
    bytes32 functionSignature;
    uint256 value;
    uint256 callId;
    address from;
    // uint32 gasLimit;
    // uint24 flags;
    // uint16 permissions;
    address to;
    bytes data;
    uint256[] types;
    bytes32[] typedHashes;
}

struct MSCalls {
    // address builder;
    bytes32 typeHash;
    uint256 sessionId;
    bytes32 nameHash;
    address builder;
    MSCall[] mcall;
    Signature[] signatures;
    bytes32[] variables;
    address[] externalSigners;
}

interface IFCT_Engine {
    function getIDs() external pure returns (bytes32[] memory);
    function VERSION() external pure returns (bytes3);

    function batchMultiSigCall(
        bytes32 version,
        MSCalls[] calldata tr,
        bytes32[] calldata purgeFCTs
    ) external returns (bytes32[] memory names, address[] memory builders, uint256[] memory maxGasPrices, MReturn[][] memory);

}
