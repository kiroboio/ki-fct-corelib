// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import '@uniswap/v2-core/contracts/UniswapV2Router.sol';
import '@uniswap/v2-core/contracts/UniswapV2Pair.sol';
import '@uniswap/v2-core/contracts/UniswapV2Factory.sol';
import "hardhat/console.sol";


contract MultiplyTest {
    uint256 public multiplier = 2;

    struct Test{
      uint256 value;
      address from;
      string name;
      bytes number;
    }

    struct Struct2 {
      string name1;
      bytes number1;
      string name2;
    }

    function getMultiCalc(uint256 input) public view returns(uint256){
      return multiplier * input;
    }

    function getUniswapAddress() public pure returns(address){
      return 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    }

    function getBytes32() public pure returns(bytes32){
      return keccak256("this is a bytes32 string");
    }

    function revertCall() public pure {
      require(1 == 2, "reverting the call");
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

    //testCall3(bytes,string,bytes,(uint256,address,string,bytes),bytes)
    function testCall3(bytes memory to, 
                      string memory name1, 
                      bytes memory value, 
                      Test memory test,
                      bytes memory from
                      ) public view returns(bool)
    {
      return true;
    }

  //testCall4(bytes,(string,bytes,string)[],string)
    function testCall4(bytes memory to, 
                      Struct2[] memory struct2,
                      string memory from
                      ) public view returns(bool)
    {
      return true;
    }
}