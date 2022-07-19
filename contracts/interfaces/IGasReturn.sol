// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/** @dev Gas return contract interfaces */
interface IGasReturn {
    function getGasRemaining(uint256 tokenId) external view returns (uint256);

    function getKiroAvailableToCollect(uint256 tokenId)
        external
        view
        returns (uint256);

    function isRequestedToCollect(uint256 tokenId) external view returns (bool);
}
