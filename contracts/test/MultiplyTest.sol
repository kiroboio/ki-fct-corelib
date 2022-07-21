// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

contract MultiplyTest {
    uint256 public multiplier = 2;
    
    function getMultiCalc(uint256 input) public view returns(uint256){
      return multiplier * input;
    }
}