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
    address from;
    uint32 gasLimit;
    uint8 flags;
    address to;
    bytes data;
    uint256[] types;
    bytes32[] typedHashes;
}

struct MSCalls {
    address builder;
    bytes32 typeHash;
    uint256 sessionId;
    string name;
    MSCall[] mcall;
    Signature[] signatures;
    bytes32[] variables;
    address[] externalSigners;
}

struct MCall {
    bytes32 typeHash;
    bytes32 ensHash;
    uint256 value;
    bytes32 functionSignature;
    address to;
    uint32 gasLimit;
    uint8 flags;
    bytes data;
}

struct MCalls {
    bytes32 r;
    bytes32 s;
    bytes32 typeHash;
    uint256 sessionId;
    // address signer;
    uint8 v;
    MCall[] mcall;
}

// struct MReturn {
//     address vault;
//     uint88 gas;
// }

interface IFCT_Engine {
    function getIDs() external pure returns (bytes32[] memory);
    function VERSION() external pure returns (bytes3);

    function batchMultiSigCall_(
        bytes3 version,
        MSCalls[] calldata tr
        // bytes32[][] calldata variables
    ) external returns (MReturn[][] memory);

}
