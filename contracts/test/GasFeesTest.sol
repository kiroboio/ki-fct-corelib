// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

contract GasFeesTest {
    uint256 public msgLength;
    uint256 public dummy;
    
    function returnsInputBytes(bytes memory input) payable public returns(bytes memory){
      return input;
    }

    function noReturn(bytes memory input) external {      
    }

    function noInput() external {      
    }

    function gasReturnExecute(
      address payable to,
      uint256 value,
      bytes calldata data,
      uint256 nftId
    ) external returns (bytes memory res) {
      uint256 gasStart = gasleft() + (data.length == 0 ? 22910 : data.length*12 + (((data.length-1)/32)*128) + 23325);
      if (to == address(0) && value == 0 && nftId == 0) {
        dummy = 12;
      }
      uint256 msgStore = msgLength == 0 ? 20000 : 2854;
      if (data.length > 0) {
        msgStore += 110 + (((data.length-1)/32)*82);
      }
      msgLength = msgStore + gasStart - gasleft();
      return "1212"; // returnsInputBytes(data);
    }
}