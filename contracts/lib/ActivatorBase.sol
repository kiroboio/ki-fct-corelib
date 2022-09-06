// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import "../interfaces/ITokenEconomy.sol";
import "openzeppelin-solidity/contracts/access/AccessControl.sol";

/**@dev this contract get inherited from the Activator contract
        it hold getters and setters for the activators functionality */
abstract contract ActivatorBase is IActivator, AccessControl {
  address immutable s_factory;

  ActivatorRequirements internal s_backupRequirements;
  ActivatorRequirements internal s_inheritanceRequirements;
  ActivatorRequirements internal s_tokenInheritanceRequirements;
  uint256 internal s_backupCreateFee;
  uint256 internal s_inheritanceCreateFee;
  uint256 internal s_tokenInheritanceCreateFee;
  address immutable s_kiro;
  uint256 internal s_timeout;
  mapping(address => uint256) public s_whitelist;

  constructor(address kiro, address factory) {
    s_kiro = kiro;
    s_factory = factory;
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }

/**@dev this function sets a timeout period between activation of backup/inheritance and token inheritance 
  @param timeout the time needed to pass untill an activator can again activate a transaction*/
  function setTimeout(uint256 timeout) external override onlyRole(DEFAULT_ADMIN_ROLE) {
    s_timeout = timeout;
    emit TimeoutChanged(timeout);
  }

  /**@dev gets the current timeout */
  function getTimeout() external view override returns(uint256) {
    return s_timeout;
  }

/**@dev adds an address to the activators whilelist, once in the whitelist, and activator is able to activate 
        transactions by having at least the amount of kiro needed to be an activator  
    @param account address of activator*/
  function addToWhitelist(address account) external override onlyRole(DEFAULT_ADMIN_ROLE)  {
    s_whitelist[account] = 1;
    emit AddedToWhitelist(account);
  }
/**@dev removes an address from the activators WL 
  @param account address of activator*/
  function removeFromWhitelist(address account) external override onlyRole(DEFAULT_ADMIN_ROLE) {
    s_whitelist[account] = 0;
    emit RemovedFromWhitelist(account);
  }

/**@dev sets the fee required in order to set a new inheritance, 
        this fee will be payed to the activator that will activate the inheritance 
  @param createFee amount of fee*/
  function setInheritanceFees(
    uint256 createFee
  ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
    s_inheritanceCreateFee = createFee;
    emit InheritanceFees(createFee);
  }

/**@dev sets the fee required in order to set a new token inheritance, 
        this fee will be payed to the activator that will activate the token inheritance 
  @param createFee amount of fee*/
  function setTokenInheritanceFees(
    uint256 createFee
  ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
    s_tokenInheritanceCreateFee = createFee;
    emit TokenInheritanceFees(createFee);
  }

/**@dev sets the fee required in order to set a new backup, 
        this fee will be payed to the activator that will activate the backup 
  @param createFee amount of fee*/
  function setBackupFees(
    uint256 createFee  
  ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
    s_backupCreateFee = createFee;
    emit BackupFees(createFee);
  }

/**@dev this function sets the parameters for the backup activation requirments
  @param hasVault bool stating if it's required to have a vault as an activator
  @param kiroAmount amount of kiro needed in order to activate a transaction as an activator
  @param whitelistedKiroAmount amount of kiro needed in to activate a transaction as a WL activator
  @param discountedBPS discount in holding kiro as an activator
  @param discountNFT NFT address, that gives a discount for holding kiro as an activator*/
  function setBackupRequirements(
    bool hasVault,
    uint256 kiroAmount,
    uint256 whitelistedKiroAmount,
    uint256 discountedBPS,
    address discountNFT
  ) external override {
    require(discountedBPS <= 10000, "max is 100%");
    s_backupRequirements.kiroAmount = kiroAmount;
    s_backupRequirements.whitelistedKiroAmount = whitelistedKiroAmount;
    s_backupRequirements.hasVault = hasVault;
    s_backupRequirements.discountedBPS = discountedBPS;
    s_backupRequirements.discountNFT = discountNFT;
    emit BackupRequirements(hasVault, kiroAmount, discountedBPS, discountNFT);
  }

/**@dev this function sets the parameters for the inheritance activation requirments
  @param hasVault bool stating if it's required to have a vault as an activator
  @param kiroAmount amount of kiro needed in order to activate a transaction as an activator
  @param whitelistedKiroAmount amount of kiro needed in to activate a transaction as a WL activator
  @param discountedBPS discount in holding kiro as an activator
  @param discountNFT NFT address, that gives a discount for holding kiro as an activator*/
  function setInheritanceRequirements(
    bool hasVault,
    uint256 kiroAmount,
    uint256 whitelistedKiroAmount,
    uint256 discountedBPS,
    address discountNFT
  ) external override {
    require(discountedBPS <= 10000, "max is 100%");
    s_inheritanceRequirements.hasVault = hasVault;
    s_inheritanceRequirements.kiroAmount = kiroAmount;
    s_inheritanceRequirements.whitelistedKiroAmount = whitelistedKiroAmount;
    s_inheritanceRequirements.discountedBPS = discountedBPS;
    s_inheritanceRequirements.discountNFT = discountNFT;
    emit InheritanceRequirements(hasVault, kiroAmount, discountedBPS, discountNFT);
  }

/**@dev this function sets the parameters for the token inheritance activation requirments
  @param hasVault bool stating if it's required to have a vault as an activator
  @param kiroAmount amount of kiro needed in order to activate a transaction as an activator
  @param whitelistedKiroAmount amount of kiro needed in to activate a transaction as a WL activator
  @param discountedBPS discount in holding kiro as an activator
  @param discountNFT NFT address, that gives a discount for holding kiro as an activator*/
  function setTokenInheritanceRequirements(
    bool hasVault,
    uint256 kiroAmount,
    uint256 whitelistedKiroAmount,
    uint256 discountedBPS,
    address discountNFT
  ) external override {
    require(discountedBPS <= 10000, "max is 100%");
    s_tokenInheritanceRequirements.hasVault = hasVault;
    s_tokenInheritanceRequirements.kiroAmount = kiroAmount;
    s_tokenInheritanceRequirements.whitelistedKiroAmount = whitelistedKiroAmount;
    s_tokenInheritanceRequirements.discountedBPS = discountedBPS;
    s_tokenInheritanceRequirements.discountNFT = discountNFT;
    emit TokenInheritanceRequirements(hasVault, kiroAmount, discountedBPS, discountNFT);
  }

  function getBackupRequirements()
    external
    view
    override
    returns (ActivatorRequirements memory)
  {
    return s_backupRequirements;
  }

  function getBackupFees()
    external
    view
    override
    returns (Fees memory)
  {
    Fees memory backupFees;
    backupFees.kiro = s_kiro;
    backupFees.fee = s_backupCreateFee;

    return backupFees;
  }

  function getInheritanceRequirements()
    external
    view
    override
    returns (ActivatorRequirements memory)
  {
    return s_inheritanceRequirements;
  }

  function getInheritanceFees()
    external
    view
    override
    returns (Fees memory)
  {
    Fees memory inheritanceFees;
    inheritanceFees.kiro = s_kiro;
    inheritanceFees.fee = s_inheritanceCreateFee;
    
    return inheritanceFees;
  }

  function getTokenInheritanceRequirements()
    external
    view
    override
    returns (ActivatorRequirements memory)
  {
    return s_tokenInheritanceRequirements;
  }

  function getTokenInheritanceFees()
    external
    view
    override
    returns (Fees memory)
  {
    Fees memory inheritanceFees;
    inheritanceFees.kiro = s_kiro;
    inheritanceFees.fee = s_tokenInheritanceCreateFee;
    
    return inheritanceFees;
  }

}
