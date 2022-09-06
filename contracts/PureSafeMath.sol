// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import "hardhat/console.sol";

/** @title Validator contract 
    @author Tal Asa <tal@kirobo.io> 
    @notice Validator contract - implements the validation part of the FCT platform
 */
contract PureSafeMath {
    constructor() {}

    function add(
        uint256 value1,
        uint256 value2
    ) external pure returns (uint256) {
        return value1 + value2;
    }

    function sub(
        uint256 value1,
        uint256 value2
    ) external pure returns (uint256) {
        return value1 - value2;
    }

    function mul(
        uint256 value1,
        uint256 value2
    ) external pure returns (uint256) {
        return value1 * value2;
    }

    function div(
        uint256 value1,
        uint256 value2
    ) external pure returns (uint256) {
        return value1 / value2;
    }

    function mulAndDiv(
        uint256 value1,
        uint256 value2,
        uint256 value3
    ) external pure returns (uint256) {
      return value1 * value2 / value3;
    }

    function mod(
        uint256 value1,
        uint256 value2
    ) external pure returns (uint256) {
        return value1 % value2;
    }

}
