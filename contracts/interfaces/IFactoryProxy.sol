// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

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
    address signer;
    uint32 gasLimit;
    uint16 flags;
    address to;
    bytes data;
}

struct MSCalls {
    bytes32 typeHash;
    uint256 sessionId;
    MSCall[] mcall;
    Signature[] signatures;
}

struct MCall {
    bytes32 typeHash;
    bytes32 ensHash;
    uint256 value;
    bytes32 functionSignature;
    address to;
    uint32 gasLimit;
    uint16 flags;
    bytes data;
}

struct MCalls {
    bytes32 r;
    bytes32 s;
    bytes32 typeHash;
    uint256 sessionId;
    address signer;
    uint8 v;
    MCall[] mcall;
}

struct MReturn {
    address vault;
    uint88 gas;
}

interface IFactoryProxy {
    function batchMultiCall_(MCalls[] calldata tr, uint256 nonceGroup)
        external
        returns (MReturn[] memory);

    function batchMultiSigCall_(
        MSCalls[] calldata tr,
        bytes32[] calldata variables
    ) external returns (MReturn[][] memory);
}
