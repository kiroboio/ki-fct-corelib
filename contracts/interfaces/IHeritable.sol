// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v1;


interface IHeritable {
  function activateInheritance() external returns (bool);
  function activateTokenInheritance(address token) external returns (bool);
}

