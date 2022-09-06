// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import "hardhat/console.sol";

/** @title Validator contract 
    @author Tal Asa <tal@kirobo.io> 
    @notice Validator contract - implements the validation part of the FCT platform
 */
contract PureValidator {
    constructor() {}

    /** @notice greaterThan - reverts if the result of the call is not greater than a given value
        @param value1 (uint256)
        @param value2 (uint256)
     */
    function greaterThan(
        uint256 value1,
        uint256 value2
    ) external pure returns (uint256) {
        require(value1 > value2, "validator: not met");
        return value1 - value2;
    }

    /** @notice greaterEqual - reverts if the result of the call is not greater or equal to a given value
        @param value1 (uint256)
        @param value1 (uint256)
     */
    function greaterEqual(
        uint256 value1,
        uint256 value2
    ) external pure returns (uint256) {
        require(value1 >= value2, "validator: not met");
        return value1 - value2;
    }

    /** @notice lessThan - reverts if the result of the call is not less than a given value
        @param value1 (uint256)
        @param value2 (uint256)
     */
    function lessThan(
        uint256 value1,
        uint256 value2
    ) external pure returns (uint256) {
        require(value1 < value2, "validator: not met");
        return value2 - value1;
    }

    /** @notice lessEqual - reverts if the result of the call is not less or equal to a given value
        @param value1 (uint256)
        @param value2 (uint256)
     */
    function lessEqual(
        uint256 value1,
        uint256 value2
    ) external pure returns (uint256) {
      require(value1 <= value2, "validator: not met");
        return value2 - value1;
    }

    /** @notice betweenNotEqual - reverts if the result of the call is not between but not equals to 2 given values
        @param minValue (uint256)
        @param maxValue (uint256)
        @param value (uint256)
     */
    function between(
        uint256 minValue,
        uint256 maxValue,
        uint256 value
    ) external pure returns (uint256) {     
          require(minValue < maxValue, "validator: wrong inputs");
     require((value > minValue) && (value < maxValue), "validator: not met");
          return value - minValue;
    }

    /** @notice betweenEqual - reverts if the result of the call is not between and equals to 2 given values
        @param minValue (uint256)
        @param maxValue (uint256)
        @param value (uint256)
     */
    function betweenEqual(
        uint256 minValue,
        uint256 maxValue,
        uint256 value
        ) external pure returns (uint256) {
          require(minValue < maxValue, "validator: wrong inputs");
          require((value >= minValue) && (value <= maxValue), "validator: not met");
          return value - minValue;
    }

    /** @notice equal - reverts if the result of the call is not equal to a given value
        @param value1 (uint256)
        @param value2 (uint256)
     */
    function equal(
        uint256 value1,
        uint256 value2
    ) external pure returns (uint256) {
        require(value1 == value2, "validator: not met");
        return value1;
    }

    /** @notice addressesCompare - reverts if the result address of the call is not equal to a given address
        @param address1 (address)
        @param address2 (address)
     */
      function equal(
        address address1,
        address address2
    ) external pure returns (address) {
        require(address1 == address2, "validator: not met");
        return address1;
    }

     /** @notice bytes32Compare - reverts if the result bytes32 of the call is not equal to a given bytes32
        @param value1 (bytes32)
        @param value2 (bytes32)
     */
      function equal(
        bytes32 value1,
        bytes32 value2
    ) external pure returns (bytes32) {
        require(value1 == value2, "validator: not met");
        return value1;
    }

}
