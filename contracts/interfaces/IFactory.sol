// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface IFactory {
  function getWallet(address account) external view returns (address);
  function getWalletOfOwner(address owner) external view returns (address);
}
