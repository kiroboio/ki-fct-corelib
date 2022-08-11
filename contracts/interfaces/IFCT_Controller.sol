// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

struct MReturn {
    address vault;
    uint88 gas;
}

struct Meta {
    uint40 timestamp;
    uint40 chilltime;
    uint32 amount;
    uint8 chillmode;
    bool eip712;
}

interface IFCT_Controller {
    function DOMAIN_SEPARATOR() external view returns (bytes32);
    // function activate(bytes calldata data) external returns (MReturn[][] memory);
    // function register(bytes32 id, bytes32 messageHash) external;
    function register(bytes32 id, bytes32 messageHash, Meta calldata meta) external returns (bytes32);
    function ensToAddress(bytes32 ensHash, address expectedAddress) external view returns (address result);
    function funcAddress(bytes32 funcID) external view returns (address);
    // function messageToRecover(bytes32 hashedUnsignedMessage, bool eip712) external view returns (bytes32);
}
