// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v1;

/** @title Validator contract 
    @author Tal Asa <tal@kirobo.io> 
    @notice Validator contract - implements the validation part of the FCT platform
 */
contract Validator {
    constructor() {}

    /** @notice greaterThen - reverts if the result of the call is not greater than a given value
        @param valueToCompare (uint256) - value to compare the calling result to
        @param contractAddress (address) - the contract address 
        @param functionSignature (bytes32) - sha3 of the function name and param types 
        @param data (bytes) - funcion_signature + encoded_params
     */
    function greaterThen(
        uint256 valueToCompare,
        address contractAddress,
        bytes32 functionSignature,
        bytes calldata data
    ) external returns (bytes memory) {
        (bool success, bytes memory result) = contractAddress.call(
            abi.encodePacked(bytes4(functionSignature), data)
        );
        if (!success) {
            revert("validator: call failed");
        }
        require(
            abi.decode(result, (uint256)) > valueToCompare,
            "validator: not met"
        );
        return result;
    }
}
