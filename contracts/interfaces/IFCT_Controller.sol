// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

struct MReturn {
    address vault;
    uint88 gas;
}

struct MetaInput {
    uint40 expiresAt;
    uint32 chilltime;
    uint16 startamount;
    bool accumatable;
    bool eip712;
    bool purgeable;
    bool cancelable;
}

struct Meta {
    uint40 starttime;
    uint40 lasttime;
    uint40 timestamp;
    uint40 expiresAt;
    uint32 chilltime;
    uint16 amount;
    uint16 startamount;
    bool accumatable;
    bool eip712;
    bool purgeable;
    bool cancelable;
}

interface IFCT_Controller {
    function DOMAIN_SEPARATOR() external view returns (bytes32);
    // function activate(bytes calldata data) external returns (MReturn[][] memory);
    // function register(bytes32 id, bytes32 messageHash) external;
    function register(bytes32 id, bytes32 messageHash, MetaInput calldata meta) external returns (bytes32);
    function ensToAddress(bytes32 ensHash, address expectedAddress) external view returns (address result);
    function funcAddress(bytes32 funcID) external view returns (address);
    function purge(bytes32 id, bytes32[] calldata messageHashes) external;
    // function messageToRecover(bytes32 hashedUnsignedMessage, bool eip712) external view returns (bytes32);
}
