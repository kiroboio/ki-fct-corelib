// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import "hardhat/console.sol";

/** @title Validator contract 
    @author Tal Asa <tal@kirobo.io> 
    @notice Validator contract - implements the validation part of the FCT platform
 */
contract Validator {
    constructor() {}

    /** @notice greaterThan - reverts if the result of the call is not greater than a given value
        @param valueToCompare (uint256) - value to compare the calling result to
        @param contractAddress (address) - the contract address 
        @param functionSignature (bytes32) - sha3 of the function name and param types 
        @param data (bytes) - funcion_signature + encoded_params
     */
    function greaterThan(
        uint256 valueToCompare,
        address contractAddress,
        bytes32 functionSignature,
        bytes calldata data
    ) external returns (bytes32) {
        console.log("Value to compare", valueToCompare);
        (bool success, bytes memory result) = contractAddress.call(
            abi.encodePacked(bytes4(functionSignature), data)
        );
        if (!success) {
            revert("validator: call failed");
        }
        console.log("validator data %s", abi.decode(result, (uint256)));
        console.logBytes(result);
        require(
            abi.decode(result, (uint256)) > valueToCompare,
            "validator: not met"
        );
        return abi.decode(result, (bytes32));
    }

    /** @notice greaterEqual - reverts if the result of the call is not greater or equal to a given value
        @param valueToCompare (uint256) - value to compare the calling result to
        @param contractAddress (address) - the contract address 
        @param functionSignature (bytes32) - sha3 of the function name and param types 
        @param data (bytes) - funcion_signature + encoded_params
     */
    function greaterEqual(
        uint256 valueToCompare,
        address contractAddress,
        bytes32 functionSignature,
        bytes calldata data
    ) external returns (bytes32) {
        (bool success, bytes memory result) = contractAddress.call(
            abi.encodePacked(bytes4(functionSignature), data)
        );
        if (!success) {
            revert("validator: call failed");
        }
        require(
            abi.decode(result, (uint256)) >= valueToCompare,
            "validator: not met"
        );
        return abi.decode(result, (bytes32));
    }

    /** @notice lessThan - reverts if the result of the call is not less than a given value
        @param valueToCompare (uint256) - value to compare the calling result to
        @param contractAddress (address) - the contract address 
        @param functionSignature (bytes32) - sha3 of the function name and param types 
        @param data (bytes) - funcion_signature + encoded_params
     */
    function lessThan(
        uint256 valueToCompare,
        address contractAddress,
        bytes32 functionSignature,
        bytes calldata data
    ) external returns (bytes32) {
        (bool success, bytes memory result) = contractAddress.call(
            abi.encodePacked(bytes4(functionSignature), data)
        );
        if (!success) {
            revert("validator: call failed");
        }
        require(
            abi.decode(result, (uint256)) < valueToCompare,
            "validator: not met"
        );
        return abi.decode(result, (bytes32));
    }

    /** @notice lessEqual - reverts if the result of the call is not less or equal to a given value
        @param valueToCompare (uint256) - value to compare the calling result to
        @param contractAddress (address) - the contract address 
        @param functionSignature (bytes32) - sha3 of the function name and param types 
        @param data (bytes) - funcion_signature + encoded_params
     */
    function lessEqual(
        uint256 valueToCompare,
        address contractAddress,
        bytes32 functionSignature,
        bytes calldata data
    ) external returns (bytes32) {
        (bool success, bytes memory result) = contractAddress.call(
            abi.encodePacked(bytes4(functionSignature), data)
        );
        if (!success) {
            revert("validator: call failed");
        }
        require(
            abi.decode(result, (uint256)) <= valueToCompare,
            "validator: not met"
        );
        return abi.decode(result, (bytes32));
    }

    /** @notice betweenNotEqual - reverts if the result of the call is not between but not equals to 2 given values
        @param value1ToCompare (uint256) - value to compare the calling result to
        @param value2ToCompare (uint256) - value to compare the calling result to
        @param contractAddress (address) - the contract address 
        @param functionSignature (bytes32) - sha3 of the function name and param types 
        @param data (bytes) - funcion_signature + encoded_params
     */
    function betweenNotEqual(
        uint256 value1ToCompare,
        uint256 value2ToCompare,
        address contractAddress,
        bytes32 functionSignature,
        bytes calldata data
    ) external returns (bytes32) {
        (bool success, bytes memory result) = contractAddress.call(
            abi.encodePacked(bytes4(functionSignature), data)
        );
        if (!success) {
            revert("validator: call failed");
        }
        require(
            abi.decode(result, (uint256)) > value1ToCompare &&
                abi.decode(result, (uint256)) < value2ToCompare,
            "validator: not met"
        );
        return abi.decode(result, (bytes32));
    }

    /** @notice betweenEqual - reverts if the result of the call is not between and equals to 2 given values
        @param value1ToCompare (uint256) - value to compare the calling result to
        @param value2ToCompare (uint256) - value to compare the calling result to
        @param contractAddress (address) - the contract address 
        @param functionSignature (bytes32) - sha3 of the function name and param types 
        @param data (bytes) - funcion_signature + encoded_params
     */
    function betweenEqual(
        uint256 value1ToCompare,
        uint256 value2ToCompare,
        address contractAddress,
        bytes32 functionSignature,
        bytes calldata data
    ) external returns (bytes32) {
        (bool success, bytes memory result) = contractAddress.call(
            abi.encodePacked(bytes4(functionSignature), data)
        );
        if (!success) {
            revert("validator: call failed");
        }
        require(
            (abi.decode(result, (uint256)) > value1ToCompare &&
                abi.decode(result, (uint256)) < value2ToCompare) ||
                abi.decode(result, (uint256)) == value1ToCompare ||
                abi.decode(result, (uint256)) == value2ToCompare,
            "validator: not met"
        );
        return abi.decode(result, (bytes32));
    }

    /** @notice addressesCompare - reverts if the result address of the call is not equal to a given address
        @param addressToCompare (address) - value to compare the calling result to
        @param contractAddress (address) - the contract address 
        @param functionSignature (bytes32) - sha3 of the function name and param types 
        @param data (bytes) - funcion_signature + encoded_params
     */
    function addressesCompare(
        address addressToCompare,
        address contractAddress,
        bytes32 functionSignature,
        bytes calldata data
    ) external returns (bytes32) {
        (bool success, bytes memory result) = contractAddress.call(
            abi.encodePacked(bytes4(functionSignature), data)
        );
        if (!success) {
            revert("validator: call failed");
        }
        require(
            abi.decode(result, (address)) <= addressToCompare,
            "validator: not met"
        );
        return abi.decode(result, (bytes32));
    }
}
