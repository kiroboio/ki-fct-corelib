// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "./interfaces/IOracle.sol";
import "./lib/Heritable.sol";

contract WalletCore is IVersion, Heritable {
    using SignatureChecker for address;

    uint8 public constant VERSION_NUMBER = 0x2;
    string public constant NAME = "Kirobo OCW";
    string public constant VERSION = "2";

    function version() public pure override returns (bytes8) {
        return bytes8("1.2.1");
    }

    // fallback() external {
    //     if (
    //         msg.sig == SELECTOR_ON_ERC721_RECEIVED ||
    //         msg.sig == SELECTOR_ON_ERC1155_RECEIVED ||
    //         msg.sig == SELECTOR_ON_ERC1155_BATCH_RECEIVED
    //     ) {
    //         assembly {
    //             calldatacopy(0, 0, 0x04)
    //             return(0, 0x20)
    //         }
    //     }
    // }

    // receive() external payable {
    //     require(false, "Wallet: not aceepting ether");
    // }


}
