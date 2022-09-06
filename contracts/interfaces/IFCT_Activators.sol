// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface IFCT_Activators {
    function totalLocked() external view returns (uint256);
    function getActivator(uint256 lockedPos) external view returns (address);
}
