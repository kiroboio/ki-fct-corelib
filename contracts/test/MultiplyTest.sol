// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import '@uniswap/v2-core/contracts/UniswapV2Router.sol';
import '@uniswap/v2-core/contracts/UniswapV2Pair.sol';
import '@uniswap/v2-core/contracts/UniswapV2Factory.sol';


contract MultiplyTest {
    uint256 public multiplier = 2;

    function getMultiCalc(uint256 input) public view returns(uint256){
      return multiplier * input;
    }

    function getUniswapAddress() public pure returns(address){
      return 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    }

    function getBytes32() public pure returns(bytes32){
      return keccak256("this is a bytes32 string");
    }

    function testCall(address to, 
                      uint256 value, 
                      string memory name1, 
                      string memory name2, 
                      bytes memory b,
                      string[] memory strArr,
                      bytes memory b2
                      ) public pure returns(bool)
    {
      return true;
    }
  //testCall2(address,string,uint256,string,bytes,uint256,string[],bytes,address)
    function testCall2(address to, 
                      string memory name1, 
                      uint256 value, 
                      string memory name2, 
                      bytes memory b,
                      uint256 value2,
                      string[] memory strArr,
                      bytes memory b2,
                      address from
                      ) public pure returns(bool)
    {
      return true;
    }
}