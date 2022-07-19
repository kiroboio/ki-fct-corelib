// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

contract UniswapPair {
  uint public price0CumulativeLast;
  uint public price1CumulativeLast;
  address public immutable token0;
  address public immutable token1;

  constructor(address i_token0, address i_token1){
    token0 = i_token0; //0xB678E95F83aF08E7598EC21533F7585E83272799;
    token1 = i_token1; //0xc778417E063141139Fce010982780140Aa0cD5Ab;
  }

  function getReserves() public pure returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = 3606940472976604512800;
        _reserve1 = 6297190062386721712;
        _blockTimestampLast = 1653377948;
  }

  function updatePriceCumulativesLast(uint price0, uint price1) external {
    price0CumulativeLast = price0;
    price1CumulativeLast = price1;
  }
}
