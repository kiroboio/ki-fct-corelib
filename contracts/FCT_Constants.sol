// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v1;

abstract contract FCT_Constants {
    uint256 internal constant FLAG_EIP712 = 0x0100;
    uint256 internal constant FLAG_STATICCALL = 0x0400;
    uint256 internal constant FLAG_CANCELABLE = 0x0800;
    uint256 internal constant FLAG_PAYMENT = 0xf000;

    uint256 internal constant FLAG_FLOW = 0x00f0;
    uint256 internal constant FLAG_JUMP = 0x000f;

    uint256 public constant OK_CONT_FAIL_REVERT = 0x0010;
    string public constant OK_CONT_FAIL_REVERT_MSG =
        "continue on success, revert on fail";
    bytes32 public constant OK_CONT_FAIL_REVERT_HASH =
        keccak256(abi.encodePacked(OK_CONT_FAIL_REVERT_MSG));

    uint256 public constant OK_CONT_FAIL_STOP = 0x0020;
    string public constant OK_CONT_FAIL_STOP_MSG =
        "continue on success, stop on fail";
    bytes32 public constant OK_CONT_FAIL_STOP_HASH =
        keccak256(abi.encodePacked(OK_CONT_FAIL_STOP_MSG));

    uint256 public constant OK_CONT_FAIL_JUMP = 0x0030;
    string public constant OK_CONT_FAIL_JUMP_MSG =
        "continue on success, jump on fail";
    bytes32 public constant OK_CONT_FAIL_JUMP_HASH =
        keccak256(abi.encodePacked(OK_CONT_FAIL_JUMP_MSG));

    uint256 public constant OK_REVERT_FAIL_CONT = 0x0040;
    string public constant OK_REVERT_FAIL_CONT_MSG =
        "revert on success, continue on fail";
    bytes32 public constant OK_REVERT_FAIL_CONT_HASH =
        keccak256(abi.encodePacked(OK_REVERT_FAIL_CONT_MSG));

    uint256 public constant OK_STOP_FAIL_CONT = 0x0050;
    string public constant OK_STOP_FAIL_CONT_MSG =
        "stop on success, continue on fail";
    bytes32 public constant OK_STOP_FAIL_CONT_HASH =
        keccak256(abi.encodePacked(OK_STOP_FAIL_CONT_MSG));

    uint256 public constant OK_JUMP_FAIL_CONT = 0x0060;
    string public constant OK_JUMP_FAIL_CONT_MSG =
        "jump on success, continue on fail";
    bytes32 public constant OK_JUMP_FAIL_CONT_HASH =
        keccak256(abi.encodePacked(OK_JUMP_FAIL_CONT_MSG));
}
    uint256 constant VAR_MIN = 0x00FC00000000000000000000000000000000000000;
    uint256 constant VAR_MAX = 0x00FC00000000000000000000000000000000000100;
    uint256 constant VARX_MIN =
        0xFC00000000000000000000000000000000000000000000000000000000000000;
    uint256 constant VARX_MAX =
        0xFC00000000000000000000000000000000000000000000000000000000000100;
    uint256 constant RET_MIN = 0x00FD00000000000000000000000000000000000000;
    uint256 constant RET_MAX = 0x00FD00000000000000000000000000000000010000;
    uint256 constant RETX_MIN =
        0xFD00000000000000000000000000000000000000000000000000000000000000;
    uint256 constant RETX_MAX =
        0xFD00000000000000000000000000000000000000000000000000000000010000;
    uint256 constant RET_REV = 0x00FDB0000000000000000000000000000000000000;
    uint256 constant RETX_REV =
        0xFEB0000000000000000000000000000000000000000000000000000000000000;


    uint256 constant VAR_MASK = 0x0000000000000000000000000000000000000000ff;
    uint256 constant RET_MASK = 0x00000000000000000000000000000000000000ff00;

