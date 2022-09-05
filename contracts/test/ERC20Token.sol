// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v1;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract ERC20Token is AccessControl, ERC20, ERC20Capped, ERC20Burnable {

     // keccak256("MINTER_ROLE");
    bytes32 public constant MINTER_ROLE = 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6;
    // keccak256("PAUSER_ROLE");
    bytes32 public constant PAUSER_ROLE = 0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a;
    // keccak256("BURNER_ROLE");
    bytes32 public constant BURNER_ROLE = 0x3c11d16cbaffd01df69ce1c404f6340ee057498f5f00246190ea54220576a848;
    // keccak256("MINTER_ADMIN_ROLE");
    bytes32 public constant MINTER_ADMIN_ROLE = 0x70480ee89cb38eff00b7d23da25713d52ce19c6ed428691d22c58b2f615e3d67;
    // keccak256("PAUSER_ADMIN_ROLE");
    bytes32 public constant PAUSER_ADMIN_ROLE = 0xe0e65c783ac33ff1c5ccf4399c9185066773921d6f8d050bf80781603021f097;
    // keccak256("BURNER_ADMIN_ROLE");
    bytes32 public constant BURNER_ADMIN_ROLE = 0xc8d1ad9d415224b751d781cc8214ccfe7c47716e13229475443f04f1ebddadc6;

    constructor(string memory name, string memory symbol)
        ERC20Burnable()
        ERC20Capped(2000000000000000000000000)
        ERC20(name, symbol)
    { 
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());

        _setupRole(MINTER_ADMIN_ROLE, _msgSender());
        _setupRole(PAUSER_ADMIN_ROLE, _msgSender());
        _setupRole(BURNER_ADMIN_ROLE, _msgSender());

        _setRoleAdmin(MINTER_ROLE, MINTER_ADMIN_ROLE);
        _setRoleAdmin(PAUSER_ROLE, PAUSER_ADMIN_ROLE);
        _setRoleAdmin(BURNER_ROLE, BURNER_ADMIN_ROLE);}

    // function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Capped) { }
    function _mint(address account, uint256 amount)
        internal
        override(ERC20, ERC20Capped)
    {
        ERC20Capped._mint(account, amount);
    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    // function transfer(address account, uint256 amount) public override returns (bool) {
    //     _mint(account, amount);
    //     _burn(account, amount);
    //     _mint(account, amount);
    //     _burn(account, amount);
    //     _mint(account, amount);
    //     _burn(account, amount);
    //     _mint(account, amount);
    //     _burn(account, amount);
    //     _mint(account, amount);
    //     _burn(account, amount);
    //     super.transfer(account, amount);
    // }

    // function transfer2(address account, uint256 amount) public returns (bool) {
    // }
}
