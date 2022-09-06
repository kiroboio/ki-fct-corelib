// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface IFCT_Runner {
    function LocalCall_(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 messageHash,
        address[] calldata signers, 
        uint256 sessionId
    ) external returns (bytes memory);

    function LocalStaticCall_(
        address target,
        bytes calldata data,
        bytes32 messageHash,
        address[] calldata signers, 
        uint256 sessionId
    ) external view returns (bytes memory);

    function isBlocked_(bytes32 messageHash) external view returns (uint256);

    function allowedToExecute_(address[] calldata signers, uint256 version)
        external
        view
        returns (uint256);
}
