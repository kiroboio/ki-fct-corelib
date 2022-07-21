// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./interfaces/IOracle.sol";
import "openzeppelin-solidity/contracts/access/AccessControl.sol";

contract Oracle is IOracle, AccessControl {
  mapping(address => bool) private s_tokens_20;
  mapping(address => bool) private s_tokens_721;
  address private owner;
  address payable public immutable ACTIVATOR; 

  constructor(address payable _activator) {
     ACTIVATOR = _activator; 
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }

  function update20(address token, bool safe)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    s_tokens_20[token] = safe;
  }

  function update721(address token, bool safe)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    s_tokens_721[token] = safe;
  }

  function is20Safe(address token) external view override returns (bool) {
    return s_tokens_20[token];
  }

  function is721Safe(address token) external view override returns (bool) {
    return s_tokens_721[token];
  }

  function version() external pure override returns (bytes8) {
    return bytes8("1.2.1");
  }

  function initialized(address) external pure override returns (bool) {
    return true;
  }

  function activator() external view override returns (address) {
    return ACTIVATOR;
  }

}
