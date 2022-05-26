// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/** @dev interface for the NFT contract */
interface INFT {
    function mint(
        address to,
        uint256 id,
        string memory uri
    ) external;
}
