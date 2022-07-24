// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Router01.sol';

contract MultiplyTest {
    address internal constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D ;
    uint256 public multiplier = 2;
    IUniswapV2Router01 public uniswapRouter;

    constructor(){
      uniswapRouter = IUniswapV2Router01(UNISWAP_ROUTER_ADDRESS);
    }

    function getMultiCalc(uint256 input) public view returns(uint256){
      return multiplier * input;
    }

    /* function makeAswap(
      //address[] calldata path,
      address to,
      uint deadline) 
        external returns(uint256[] memory){
        address weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; 
        address kiro = 0xB1191F691A355b43542Bea9B8847bc73e7Abb137;
        address[] calldata path = [weth, kiro];
        return uniswapRouter.swapExactTokensForTokens(1e18, 100e18, path, to, deadline);
      } */
}