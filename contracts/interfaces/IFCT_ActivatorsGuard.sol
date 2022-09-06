// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface IFCT_ActivatorsGuard {
    function canActivate(address activator) external view returns (bool);
}
