// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "../FCT_Constants.sol";

struct MReturn {
    address payer;
    uint88 gas;
}

// flags 8bit (eip712, accumatablem purgeablem blockable)
// uint256 constant META_EXPIRES_AT_BIT = 8;          // 8-48     40bit
// uint256 constant META_START_TIME_BIT = 48;         // 48-88    40bit
// uint256 constant META_LAST_TIME_BIT = 88;          // 88-128   40bit
// uint256 constant META_TIMESTAMP_BIT = 128;         // 128-168  40bit 
// uint256 constant META_CHILL_TIME_BIT = 168;        // 168-200  32bit 
// uint256 constant META_AMOUNT_BIT = 200;            // 200-216  16bit
// uint256 constant META_START_AMOUNT_BIT = 216;      // 216-232  16bit
// uint256 constant META_RESERVED_BIT = 232;          // 232-256  24bit

struct MetaInput {
    uint40 expiresAt;
    uint32 chilltime;
    uint16 startamount;
    bool accumatable;
    bool eip712;
    bool purgeable;
    bool blockable;
    uint24 reserved;
}

struct Meta {
    uint8 flags; // (eip712, accumatable, purgeable, blockable)
    uint40 expiresAt;
    uint40 starttime;
    uint40 lasttime;
    uint40 timestamp;
    uint32 chilltime;
    uint16 amount;
    uint16 startamount;
    uint24 reserved;
}

interface IFCT_Controller {
    function register(bytes32 id, bytes32 messageHash, MetaInput calldata meta) external returns (bytes32);
    function ensToAddress(bytes32 ensHash, address expectedAddress) external view returns (address result);
    function purge(bytes32 id, bytes32[] calldata messageHashes) external;
    function s_targets(bytes32 funcID) external view returns (address);
}
