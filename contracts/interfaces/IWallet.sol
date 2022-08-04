// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface IWallet { 
  function getBackupState() external view returns (uint8);
  function isInheritanceEnabled() external view returns (bool);

  function owner() external view returns (address);
  function oracle() external view returns (address);

  function isActiveOwner(address account) external view returns (bool);

  function execute2(
    address payable to,
    uint256 value,
    bytes calldata data
  ) external returns (bytes memory);

  function sendEther(address payable _to, uint256 _value) external;

  function allowedToExecute_(address signer, uint256 version)
    external
    returns (uint256);

  
}
