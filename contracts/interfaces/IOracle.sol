// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v1;

interface IOracle {

  function is20Safe(address token) external view returns (bool);

  function is721Safe(address token) external view returns (bool);

  function version() external pure returns (bytes8);

  function initialized(address wallet) external view returns (bool);

  function activator() external view returns (address);

}
