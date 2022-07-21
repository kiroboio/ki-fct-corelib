// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import "../interfaces/IOracle.sol";
import "openzeppelin-solidity/contracts/access/AccessControl.sol";

contract Oracle2 is IOracle, AccessControl {
  mapping(address => bool) private s_tokens;
  address payable public immutable ACTIVATOR; 

  constructor(address payable _activator) {
    ACTIVATOR = _activator;
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }

  function updateToken(address token, bool safe)
    public
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    s_tokens[token] = safe;
  }

  function isTokenSafe(address token) public view returns (bool) {
    return s_tokens[token];
  }

  function is20Safe(address token) public view override returns (bool) {
    return s_tokens[token];
  }

  function is721Safe(address token) public view override returns (bool) {
    return s_tokens[token];
  }

  function version() external pure override returns (bytes8) {
    return bytes8("0.1");
  }

  function initialized(address) external pure override returns (bool) {
    return true;
  }

  function activator() external view override returns (address) {
    return ACTIVATOR;
  }
}
