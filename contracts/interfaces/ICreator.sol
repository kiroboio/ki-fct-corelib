// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v1;

interface ICreator {
    function transferWalletOwnership(address newOwner) external;

    function addWalletBackup(address wallet) external;

    function removeWalletBackup(address wallet) external;

    function getLatestVersion() external view returns (address);

    function oracle() external view returns (address);
}

interface ICreatorProxy {
    function activator() external view returns (address);
}
