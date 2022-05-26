// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v1;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./lib/Heritable.sol";

contract RecoveryWalletCore is IVersion, Heritable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  uint8 public constant VERSION_NUMBER = 64;
  string public constant NAME = "Kirobo OCW";
  string public constant VERSION = "RC07-1.1";

  function version() public pure override returns (bytes8) {
    return bytes8(bytes(VERSION));
  }

  // fallback() external {
  //   if (
  //           msg.sig == SELECTOR_ON_ERC721_RECEIVED ||
  //           msg.sig == SELECTOR_ON_ERC1155_RECEIVED ||
  //           msg.sig == SELECTOR_ON_ERC1155_BATCH_RECEIVED
  //   ) {
  //           assembly {
  //               calldatacopy(0, 0, 0x04)
  //               return(0, 0x20)
  //           }
  //   }
  //   else {
  //     require(false, "method not allowd");
  //   }
  // }

}
