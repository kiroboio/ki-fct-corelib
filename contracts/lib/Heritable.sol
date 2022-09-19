// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/utils/SafeERC20.sol";

import "./Backupable.sol";
import "../interfaces/IHeritable.sol";
import "../interfaces/IOracle.sol";
import "../interfaces/ITokenEconomy.sol";

/** @title Heritable contract
    @author Tal Asa <tal@kirobo.io>
    @notice Heritable contract intreduces a way to set up heirs to the 
            funds in a specific wallet. 
            Features:
            1. the contract supports up to 8 heirs
            2. abillity to set a time (in seconds) that the funds will be sent to the heirs. 
 */
abstract contract Heritable is IHeritable, Backupable {
  using SafeERC20 for IERC20;

  uint256 internal constant CALL_GAS = 200000;

  event InheritanceActivated(
    address indexed creator,
    address indexed activator,
    address[] wallets
  );
  event InheritanceChanged(
    address indexed creator,
    address indexed owner,
    uint40 timeout,
    uint40 timestamp
  );
  event InheritanceRemoved(address indexed creator, address indexed owner);

  event InheritanceHeirsChanged(
    address indexed creator,
    address indexed owner,
    address[] wallets,
    uint16[] bps
  );
  event InheritancePayment(
    address indexed creator,
    address indexed payee,
    address indexed feeToken,
    uint256 feeValue
  );
  event TokenInheritancePayment(
    address indexed creator,
    address indexed payee,
    address indexed feeToken,
    uint256 feeValue,
    address[] tokensToAdd,
    address[] tokensToRemove
  );
  event TokenInheritanceMovingPayment(
    address indexed creator,
    address indexed payee,
    address indexed feeToken,
    uint256 feeValue,
    address[] fromTokens,
    address[] toTokens
  );
  //event TokensInheritanceRemoved(address indexed creator, address indexed owner);
  event TokenInheritanceActivated(
    address indexed creator,
    address indexed activator,
    address indexed token,
    address[] wallets
  );

  /**@dev backwords competabillity */
  function setInheritance(
    uint32 timeout,
    address payable[] memory wallets,
    uint16[] memory bps
  ) external onlyActiveOwner {
    setInheritanceAndPayment(timeout, wallets, bps, 0);
  }

  /**@notice a function that sets an inheritance with time and heirs together
  @param timeout (uint32) - hold the block timeStamp and the timeout is set from that time
  @param wallets - address payable[] - an array of wallets, one for each heir
  @param bps     - uint16[] - an array of funds for each heir (bps => 0.01%)
  @param minFee - th minimum fee the setter of the inheritance is willing to pay for the inheritance trx to be made*/
  function setInheritanceAndPayment(
    uint32 timeout,
    address payable[] memory wallets,
    uint16[] memory bps,
    uint256 minFee
  ) public onlyActiveOwner {
    require(s_inheritance.activated == false, "inheritance activated");
    uint40 timestamp = getBlockTimestamp();
    if (s_inheritance.timeout != timeout) s_inheritance.timeout = timeout;
    s_inheritance.timestamp = timestamp;
    emit InheritanceChanged(this.creator(), msg.sender, timeout, timestamp);
    setHeirsAndPayment(wallets, bps, minFee);
  }

/**@notice sets inheritancs together with tokens 
@param timeout (uint32) - hold the block timeStamp and the timeout is set from that time
  @param wallets - address payable[] - an array of wallets, one for each heir
  @param bps     - uint16[] - an array of funds for each heir (bps => 0.01%)
  @param minFee - th minimum fee the setter of the inheritance is willing to pay for the inheritance trx to be made
  @param tokensToAdd tokens to add to the inheritance
  @param tokensToRemove token to remove from an existing inheritance
  @param minFeePerToken fee for the tokens to be payed to the activators*/
  function setInheritanceWithTokens(
    uint32 timeout,
    address payable[] memory wallets,
    uint16[] memory bps,
    uint256 minFee,
    address[] calldata tokensToAdd,
    address[] calldata tokensToRemove,
    uint256 minFeePerToken
  ) public onlyActiveOwner {
    setInheritanceAndPayment(timeout, wallets, bps, minFee);
    if (tokensToAdd.length > 0 || tokensToRemove.length > 0) {
      updateTokensInheritancePayment(tokensToAdd, tokensToRemove, minFeePerToken);
    }
  }

  /**@dev backwords competabillity */
  function setInheritanceTime(uint32 timeout) external onlyActiveOwner {
    setInheritanceTimeAndPayment(timeout, 0);
  }

  /** @notice setInheritanceWithFee
                the function sets the time conditions for the inheritance
    @param timeout (uint32) - hold the block timeStamp and the timeout is set from that time
    @param minFee - th minimum fee the setter of the inheritance is willing to pay for the inheritance trx to be made*/
  function setInheritanceTimeAndPayment(uint32 timeout, uint256 minFee) public onlyActiveOwner {
    require(s_inheritance.activated == false, "inheritance activated");

    uint40 timestamp = getBlockTimestamp();

    if (s_inheritance.timeout != timeout) s_inheritance.timeout = timeout;
    if (s_inheritance.heirs[0].wallet != address(0)) {
      if (s_inheritance.enabled != true) s_inheritance.enabled = true;
    }
    _payInheritanceFees(minFee);

    s_inheritance.timestamp = timestamp;
    emit InheritanceChanged(this.creator(), msg.sender, timeout, timestamp);
  }

  /** @notice clearInheritance
    the function removes the heir list asociated with a apecific wallet
    resets the timeOut and unactivates the inharitance process from the wallet owner

    @dev the function optimizes the gas consumption by getting back 
         the gas for releasing the parameter
     */
  function clearInheritance() public onlyActiveOwner {
    emit InheritanceRemoved(this.creator(), msg.sender);

    if (s_inheritance.timeout != uint32(0)) s_inheritance.timeout = uint32(0);
    if (s_inheritance.enabled != false) s_inheritance.enabled = false;
    if (s_inheritance.activated != false) s_inheritance.activated = false;
    if (s_totalTransfered != 0) s_totalTransfered = 0;

    for (uint256 i = 0; i < MAX_HEIRS; ++i) {
      Heir storage heir = s_inheritance.heirs[i];
      if (heir.wallet == payable(0)) {
        break;
      }
      if (heir.sent != false) heir.sent = false;
    }

    s_inheritance.heirs[0].wallet = payable(0);
    address activator = IOracle(ICreator(this.creator()).oracle()).activator();
    IInheritancePayment(activator).updateInheritanceFunds(s_owner, 0);
  }

  function clearInheritanceAndTokens(address[] calldata tokensToRemove) external onlyActiveOwner {
    clearInheritance();
    if (tokensToRemove.length > 0) {
      updateTokensInheritancePayment(new address[](0), tokensToRemove, 0);
    }
  }

  /**@dev backwords competabillity */
  function setHeirs(address payable[] memory wallets, uint16[] memory bps)
    external
    onlyActiveOwner
  {
    setHeirsAndPayment(wallets, bps, 0);
  }
  /** @notice setHeir - as the name suggests, the function sets the heirs to a specific wallet
        @param wallets - address payable[] - an array of wallets, one for each heir
        @param bps     - uint16[] - an array of funds for each heir (bps => 0.01%)
        @param minFee - th minimum fee the setter of the inheritance is willing to pay for the inheritance trx to be made
        @dev            the function emits an event called InheritanceHeirsChanged with the
                        new heirs wallets and funds
     */
  function setHeirsAndPayment(address payable[] memory wallets, uint16[] memory bps, uint256 minFee)
    public
    onlyActiveOwner
  {
    require(s_inheritance.activated == false, "inheritance activated");
    require(wallets.length <= MAX_HEIRS, "too many heirs");
    require(wallets.length == bps.length, "heirs and bps don't match");
    require(wallets.length > 0, "Heirs list must include at least one heir");

    if (s_inheritance.timeout != 0) {
      if (s_inheritance.enabled != true) s_inheritance.enabled = true;
    } 

    _payInheritanceFees(minFee);

    uint256 totalBPS = 0;
    uint256 i;
    for (i = 0; i < wallets.length; ++i) {
      totalBPS += bps[i];
      require(wallets[i] != address(0), "no heir");
      require(wallets[i] != address(this), "current contract is heir");
    }
    require(totalBPS <= 10000, "total>100%");

    for (i = 0; i < wallets.length; ++i) {
      Heir storage sp_heir = s_inheritance.heirs[i];
      if (sp_heir.wallet != wallets[i]) sp_heir.wallet = wallets[i];
      if (sp_heir.bps != bps[i]) sp_heir.bps = bps[i];
      if (sp_heir.sent != false) sp_heir.sent = false;
    }
    if (i < MAX_HEIRS - 1) {
      Heir storage sp_heir = s_inheritance.heirs[i];
      if (sp_heir.wallet != payable(0)) sp_heir.wallet = payable(0);
    }

    // event related code starts here
    address[] memory walletList = new address[](i);
    uint16[] memory bpsList = new uint16[](i);
    for (uint256 inx = 0; inx < i; inx++) {
      Heir storage sp_heir = s_inheritance.heirs[inx];
      walletList[inx] = sp_heir.wallet;
      bpsList[inx] = sp_heir.bps;
    }
    emit InheritanceHeirsChanged(
      this.creator(),
      msg.sender,
      walletList,
      bpsList
    );
  }

  /**@notice activates an inheritance for a specific token 
  @param token token address*/
  function activateTokenInheritance(address token) external override returns (bool firstRun) {
    require(s_inheritance.enabled, "inheritance is not enabled");
    require(getInheritanceTimeLeft() == 0, "too early");

    firstRun = true;
    s_inheritance.activated = true;
    uint256 i;

    TokenInheritance storage sp_token_inheritance = s_token_inheritance[token];

    if (sp_token_inheritance.timestamp != s_inheritance.timestamp + s_inheritance.timeout) {
      sp_token_inheritance.timestamp = s_inheritance.timestamp + s_inheritance.timeout;
      sp_token_inheritance.totalTransfered = 0;
      for (i = 0; i < sp_token_inheritance.sent.length; i++) {
        sp_token_inheritance.sent[i] = false;
      }
    }
    uint256 currentBalance = IERC20(token).balanceOf(address(this)) + sp_token_inheritance.totalTransfered;
    // require(currentBalance > 0, "no balance");

    for (i = 0; i < s_inheritance.heirs.length; i++) {
      Heir storage sp_heir = s_inheritance.heirs[i];
      if (sp_heir.wallet == address(0)) {
        break;
      }
      if (sp_token_inheritance.sent[i]) {
        firstRun = false;
        continue;
      }
      if (sp_heir.bps > 0) {
        (bool sentHeirOK, ) = token.call{
          gas: CALL_GAS
        }(abi.encodeWithSelector(IERC20.transfer.selector, sp_heir.wallet, (currentBalance * sp_heir.bps) / 10000));
        sp_token_inheritance.sent[i] = sentHeirOK;
      } else {
        sp_token_inheritance.sent[i] = true;
      }
    }
    sp_token_inheritance.totalTransfered = currentBalance - IERC20(token).balanceOf(address(this));

    emit TokenInheritanceActivated(this.creator(), msg.sender, token, _getHeirWallets(i));
  }

  /** @notice activateInheritance function check if all the necessary measures have been fufilled
                and then sends the funds defined to the heirs wallets
     */
  function activateInheritance() external override returns (bool firstRun) {
    require(s_inheritance.enabled, "inheritance is not enabled");
    require(getInheritanceTimeLeft() == 0, "too early");

    firstRun = true;
    s_inheritance.activated = true;

    uint256 currentBalance = address(this).balance + s_totalTransfered;
    // require(currentBalance > 0, "no balance");

    uint256 i;
    for (i = 0; i < s_inheritance.heirs.length; i++) {
      Heir storage sp_heir = s_inheritance.heirs[i];
      if (sp_heir.wallet == address(0)) {
        break;
      }
      if (sp_heir.sent) {
        firstRun = false;
        continue;
      }
      if (sp_heir.bps > 0) {
        (bool sentHeirOK, ) = sp_heir.wallet.call{
          value: (currentBalance * sp_heir.bps) / 10000,
          gas: CALL_GAS
        }("");
        sp_heir.sent = sentHeirOK;
      } else {
        sp_heir.sent = true;
      }
    }
    s_totalTransfered = currentBalance - address(this).balance;

    emit InheritanceActivated(this.creator(), msg.sender, _getHeirWallets(i));
  }

  /** @notice getTotalBPS - calculates and returns the total bps (1 bps = 0.01%) sets to be sent
                once the inheritance will take effect
        @return total (uint256) 
     */
  function getTotalBPS() external view returns (uint256 total) {
    for (uint256 i = 0; i < s_inheritance.heirs.length; i++) {
      if (s_inheritance.heirs[i].wallet == address(0)) {
        break;
      }
      total += s_inheritance.heirs[i].bps;
    }
    return total;
  }

  function getTotalTransfered() external view returns (uint256 total) {
    return s_totalTransfered;
  }

  /** @notice getHeirs - get the heir list as a bytes32 array
        @return heirs (bytes32[MAX_HEIRS])
     */
  function getHeirs() external view returns (bytes32[MAX_HEIRS] memory heirs) {
    for (uint256 i = 0; i < s_inheritance.heirs.length; i++) {
      Heir storage sp_heir = s_inheritance.heirs[i];
      if (sp_heir.wallet == address(0)) {
        break;
      }
      heirs[i] = bytes32(
        (uint256(uint160(address(sp_heir.wallet))) << 96) +
          (sp_heir.sent ? uint256(1) << 88 : 0) +
          (uint256(sp_heir.bps) << 72)
      );
    }
  }

  function isInheritanceActivated() external view returns (bool) {
    return (s_inheritance.activated);
  }

  function isInheritanceEnabled() external view returns (bool) {
    return (s_inheritance.enabled);
  }

  function getInheritanceTimeout() external view returns (uint40) {
    return s_inheritance.timeout;
  }

  function getInheritanceTimestamp() external view returns (uint40) {
    return s_inheritance.timestamp;
  }

  function getInheritanceInfo() external view returns (Inheritance memory) {
    return s_inheritance;
  }

  function getTokenInheritanceInfo(address token) external view returns (TokenInheritance memory) {
    return s_token_inheritance[token];
  }

  /** @notice getInheritanceTimeLeft - checks the time left until the inheritance can be activated
        @return res (uint40) - time left in seconds untill the inheritance is enabled or 0
                    if the time has passed
    */
  function getInheritanceTimeLeft() public view returns (uint40 res) {
    uint40 timestamp = getBlockTimestamp();
    if (
      s_inheritance.timestamp > 0 &&
      timestamp >= s_inheritance.timestamp &&
      s_inheritance.timeout > timestamp - s_inheritance.timestamp
    ) {
      res = s_inheritance.timeout - (timestamp - s_inheritance.timestamp);
    }
  }

/**checks what is the minimun fee required and takes the needed fee from the user that sets the inheritance
@param minFee the minimum fee requested by the setter of the inheritance */
  function _payInheritanceFees(uint256 minFee) private {
    address activator = IOracle(ICreator(this.creator()).oracle()).activator();
    IActivator.Fees memory feesData = IActivator(activator).getInheritanceFees();
    uint256 fee = minFee >= feesData.fee ? minFee : feesData.fee;
    if (fee > 0) {
      if (IERC20(feesData.kiro).allowance(address(this), activator) < fee) {
        IERC20(feesData.kiro).approve(activator, MAX_FEES);
      }
    }
    IInheritancePayment(activator).updateInheritanceFunds(
      s_owner,
      fee
    );
    emit InheritancePayment(
      this.creator(),
      activator,
      feesData.kiro,
      fee
    );
  }

/**checks what is the minimun fee required and takes the needed fee from the user that sets the token inheritance
@param tokensToAdd tokens to add to the inheritance
@param tokensToRemove tokens to remove from the inheritance
@param minFeePerToken the minimum fee requested by the setter of the inheritance */
  function _payTokenInheritanceFees(address[] memory tokensToAdd, address[] memory tokensToRemove, uint256 minFeePerToken) private {
    address activator = IOracle(ICreator(this.creator()).oracle()).activator();
    IActivator.Fees memory feesData = IActivator(activator).getTokenInheritanceFees();
    uint256 feePerToken = minFeePerToken >= feesData.fee ? minFeePerToken : feesData.fee;
    
    if (feePerToken > 0) {
        if (IERC20(feesData.kiro).allowance(address(this), activator) < (feePerToken * tokensToAdd.length)) {
          IERC20(feesData.kiro).approve(activator, MAX_FEES);
        }
    }
    IInheritancePayment(activator).updateTokenInheritanceFunds(
      s_owner,
      tokensToAdd,
      tokensToRemove,
      feePerToken
    );
    emit TokenInheritancePayment(
      this.creator(),
      activator,
      feesData.kiro,
      feePerToken,
      tokensToAdd,
      tokensToRemove
    );
  }
/**@notice returns the wallets addresses of the heirs 
@param amount number of heirs*/
  function _getHeirWallets(uint256 amount) private view returns (address[] memory) {
    address[] memory wallets = new address[](amount);
    for (uint256 inx = 0; inx < amount; inx++) {
      wallets[inx] = s_inheritance.heirs[inx].wallet;
    }
    return wallets;
  }

/**@notice updates the fee that will be paid for activating the inheritance
   @dev this can overide the minimum requierd fee set by Kirobo
   by aware that setting to little amount as fee can cause the activators not to activate the TRX because the fee is not
   big enough to cover the TRX fee
   @param minFunds new minimum set by the setter of the inheritance*/
  function updateInheritancePayment(uint256 minFunds) external onlyActiveOwner{
    require(s_inheritance.activated == false, "inheritance activated");
    _payInheritanceFees(minFunds);
  }

/**@notice updates the tokens and fee that will be paid for activating the token inheritance
   @dev this can overide the minimum requierd fee set by Kirobo
   by aware that setting to little amount as fee can cause the activators not to activate the TRX because the fee is not
   big enough to cover the TRX fee
   @param tokensToAdd tokens to add to the inheritance
   @param tokensToRemove tokens to remove from the inheritance
   @param minFundsPerToken new minimum set by the setter of the token inheritance*/
  function updateTokensInheritancePayment(address[] memory tokensToAdd, address[] memory tokensToRemove, uint256 minFundsPerToken) public onlyActiveOwner{
    require(s_inheritance.activated == false, "inheritance activated");
    _payTokenInheritanceFees(tokensToAdd, tokensToRemove, minFundsPerToken);
  }

}
