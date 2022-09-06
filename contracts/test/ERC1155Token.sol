// contracts/GameItems.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v1;

import "openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";
contract ERC1155Token is ERC1155 {
    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant THORS_HAMMER = 2;
    uint256 public constant SWORD = 3;
    uint256 public constant SHIELD = 4;

    constructor()
        ERC1155("https://abcoathup.github.io/SampleERC1155/api/token/{id}.json")
    {
        _mint(msg.sender, GOLD, 10**18, "");
        _mint(msg.sender, SILVER, 10**27, "");
        _mint(msg.sender, THORS_HAMMER, 1, "");
        _mint(msg.sender, SWORD, 10**9, "");
        _mint(msg.sender, SHIELD, 10**9, "");
    }

    function selfMint(uint256 tokenId) public {
        _mint(msg.sender, tokenId, 500, "0x00");
    }
}
