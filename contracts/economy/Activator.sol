// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

/** @notice Activator contract 
    this contract allows user to activate pending transaction for inheritance, backup...
*/

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import "@openzeppelin/contracts/access/Ownable.sol";

import '../lib/ActivatorBase.sol';
import '../interfaces/ITokenEconomy.sol';
import '../interfaces/IBackupable.sol';
import '../interfaces/IHeritable.sol';
import '../interfaces/IFactory.sol';
import '../interfaces/IOracle.sol';
import '../interfaces/IWallet.sol';

contract Activator is IBackupPayment, IInheritancePayment, ActivatorBase {
  using SafeERC20 for IERC20;

  uint256 constant MAX_FEES = 2**196;

  uint256 public constant UPDATED = 1;
  uint256 public constant ACTIVATED = 2;

  struct InheritanceFunds {
    uint256 forEtherValue;
    mapping(address => uint256) forTokensValue;
  }

  mapping(address => uint256) public s_backupFunds;
  mapping(address => InheritanceFunds) public s_inheritanceFunds;
  mapping(address => uint256) public s_timestamp;

  event BackupFundsUpdated(
    address indexed initiator,
    address indexed vault,
    uint256 indexed reason,
    uint256 oldAmount,
    uint256 newAmount
  );

  event InheritanceFundsUpdated(
    address indexed initiator,
    address indexed vault,
    uint256 indexed reason, 
    uint256 oldAmount,
    uint256 newAmount
  );

  event TokenInheritanceFundsUpdated(
    address indexed initiator,
    address indexed vault,
    address indexed token,
    uint256 reason, 
    uint256 oldAmount,
    uint256 newAmount
  );

  /** @dev check that sender has a vault and has sufficient kiro in his vault
      @param requirements sturct
  */
  function getBeneficiary(ActivatorRequirements memory requirements) private view returns (address) {
    address beneficiary = msg.sender;
    if (requirements.hasVault) {
      beneficiary = IFactory(s_factory).getWallet(msg.sender);
      require(beneficiary != address(0), "don't have vault");
      require(IWallet(beneficiary).isActiveOwner(msg.sender) == true, "not active owner of the vault");
    }
    uint256 kiroAmount = s_whitelist[msg.sender] == 0 ? requirements.kiroAmount: requirements.whitelistedKiroAmount;
    if (requirements.discountNFT != address(0)) {
      if (IERC721(requirements.discountNFT).balanceOf(beneficiary) > 0) {
        kiroAmount = (kiroAmount * requirements.discountedBPS) / 10000;
      }
    }
    if (kiroAmount > 0) {
      require(
        IERC20(s_kiro).balanceOf(beneficiary) >= kiroAmount,
        'not enough kiro'
      );
    }
    return beneficiary;
  }

  modifier rateLimit() {
    require(s_timestamp[msg.sender] + s_timeout <= block.timestamp, "too early");
    s_timestamp[msg.sender] = block.timestamp;
    _;
  }
  
  modifier onlyVaultOfOwner(address vaultOwner) {
   require(
      IFactory(s_factory).getWallet(vaultOwner) == msg.sender,
      'not a vault'
    ); 
    _;
  }
  
  /** @notice constractor
      @param kiro kiro token address 
      @param factory contract address
  */
  constructor(address kiro, address factory) ActivatorBase(kiro, factory) {
  }

  /** @dev function that transfered the fees for the backup from the vault
      after the transfer is complete the fee is added to the s_backup_funds mapping
      @param vaultOwner vault owner address
      @param funds amount of funds to be updated
  */
  function updateBackupFunds(address vaultOwner, uint256 funds) external override onlyVaultOfOwner(vaultOwner) {
    (uint256 payment, uint256 refund) = _updateBackupFunds(vaultOwner, funds);
    _syncFunds(payment, refund);
  }

  function _updateBackupFunds(address vaultOwner, uint256 funds) private returns (uint256 payment, uint256 refund) {
    uint256 curFunds = s_backupFunds[msg.sender];
    if(funds > curFunds) {
      //need to increase funds in backupPaidFee
      uint256 increaseFunds = funds - curFunds;
      s_backupFunds[msg.sender] += increaseFunds;
      payment = increaseFunds;
    } else if(funds < curFunds) {
      //need to get back funds from backupPaidFee
      uint256 decreaseFunds = curFunds - funds;
      s_backupFunds[msg.sender] -= decreaseFunds;
      refund = decreaseFunds;
    }
    if (funds != curFunds) {
      emit BackupFundsUpdated(vaultOwner, msg.sender, UPDATED, curFunds, funds);
    }
  }

  /** @dev activates a backup transaction 
      the function checks that the activator meets the requirments (has a vault and kiro)
      then it activates the trx and gets the funds for the action he did (in kiro) 
      @param vault address that the backup trx is for
  */
  function activateBackup(address vault) external override rateLimit {
    address beneficiary = getBeneficiary(s_backupRequirements);
    IBackupable(vault).activateBackup();
    uint256 funds = s_backupFunds[vault];
    if (funds > 0) {
      s_backupFunds[vault] = 0;
      IERC20(s_kiro).safeTransfer(beneficiary, funds);
    }
    emit BackupFundsUpdated(msg.sender, vault, ACTIVATED, funds, 0);
  }

  function migrateBackup(address vaultOwner, address from)
    external
    override
  {
    address vault = IFactory(s_factory).getWallet(vaultOwner);
    address activator = IOracle(IWallet(vault).oracle()).activator();
    require(from != activator, 'same version');
    if (address(this) == activator) {
      uint256 curBalance = IERC20(s_kiro).balanceOf(address(this));
      IBackupPayment(from).migrateBackup(vaultOwner, from);
      uint256 balanceDelta = IERC20(s_kiro).balanceOf(address(this)) - curBalance;
      s_backupFunds[vault] += balanceDelta; 
    } else if (msg.sender == activator) {
      uint256 value = s_backupFunds[vault];
      s_backupFunds[vault] = 0;
      IERC20(s_kiro).safeTransfer(activator, value);
    }
  }

  /** @dev function that transfered the fees for the eth inheritance from the vault
      after the transfer is complete the fee is added to the s_inheritance_funds mapping
      @param vaultOwner vault owner address
      @param funds amount of funds to be updated
  */
  function updateInheritanceFunds(address vaultOwner, uint256 funds)
    external
    override
    onlyVaultOfOwner(vaultOwner)
  {
    (uint256 payment, uint256 refund) = _updateInheritanceFunds(vaultOwner, funds);
    _syncFunds(payment, refund);
  }

  function _updateInheritanceFunds(address vaultOwner, uint256 funds)
    private
    returns (uint256 payment, uint256 refund)
  {
    InheritanceFunds storage sp_funds = s_inheritanceFunds[msg.sender];
    uint256 curFunds = sp_funds.forEtherValue;
    if(funds > curFunds)
    {
      //need to increase funds in sp_funds.forEtherValue
      uint256 increaseFunds = funds - curFunds;
      sp_funds.forEtherValue += increaseFunds;
      payment = increaseFunds;
      // IERC20(s_kiro).safeTransferFrom(msg.sender, address(this), increaseFunds);
    } else if(funds < curFunds){
      //need to get back funds from sp_funds.forEtherValue
      uint256 decreaseFunds = curFunds - funds;
      sp_funds.forEtherValue -= decreaseFunds;
      refund = decreaseFunds;
      // IERC20(s_kiro).safeTransfer(msg.sender, decreaseFunds);
    }
    if (funds != curFunds) {
      emit InheritanceFundsUpdated(vaultOwner, msg.sender, UPDATED, curFunds, funds);
    }
  }

  /** @dev activates a inheritance transaction for eth
      the function checks that the activator meets the requirments (has a vault and kiro)
      then it activates the trx and gets the funds for the action he did (in kiro) 
      @param vault address that the inheritance trx is for
  */
  function activateInheritance(address vault) external override rateLimit {
    address beneficiary = getBeneficiary(s_inheritanceRequirements);
    if (IHeritable(vault).activateInheritance()) {
      InheritanceFunds storage sp_funds = s_inheritanceFunds[vault];
      uint256 funds = sp_funds.forEtherValue;
      if (funds > 0) {
        sp_funds.forEtherValue = 0;
        IERC20(s_kiro).safeTransfer(beneficiary, funds);
        emit InheritanceFundsUpdated(msg.sender, vault, ACTIVATED, funds, 0);
      }
    }
  }

  function migrateInheritance(address vaultOwner, address from)
    external
    override
  {
    address vault = IFactory(s_factory).getWallet(vaultOwner);
    address activator = IOracle(IWallet(vault).oracle()).activator();
    require(from != activator, 'same version');
    if (address(this) == activator) {
      uint256 curBalance = IERC20(s_kiro).balanceOf(address(this));
      IInheritancePayment(from).migrateInheritance(vaultOwner, from);
      uint256 balanceDelta = IERC20(s_kiro).balanceOf(address(this)) - curBalance;
      s_inheritanceFunds[vault].forEtherValue += balanceDelta; 
    } else if (msg.sender == activator) {
      uint256 value = s_inheritanceFunds[vault].forEtherValue;
      s_inheritanceFunds[vault].forEtherValue = 0;
      IERC20(s_kiro).safeTransfer(activator, value);
    }
  }

  /** @dev function that transfered the fees for the token inheritance from the vault
      after the transfer is complete the fee is added to the s_inheritance_funds mapping
      @param vaultOwner vault owner address
      @param tokensToAdd array of addresses
      @param tokensToRemove array of addresses
      @param fundsPerToken amount of funds to be updated per token
  */
  function updateTokenInheritanceFunds(
    address vaultOwner,
    address[] calldata tokensToAdd,
    address[] calldata tokensToRemove,
    uint256 fundsPerToken
  ) public override
    onlyVaultOfOwner(vaultOwner)
  {
    (uint256 payment, uint256 refund) = _updateTokenInheritanceFunds(vaultOwner, tokensToAdd, tokensToRemove, fundsPerToken);
    _syncFunds(payment, refund);
  }

  function _updateTokenInheritanceFunds(
    address vaultOwner,
    address[] calldata tokensToAdd,
    address[] calldata tokensToRemove,
    uint256 fundsPerToken
  ) private returns (uint256 payment, uint256 refund) {
    InheritanceFunds storage sp_inheritanceFunds = s_inheritanceFunds[msg.sender];
    uint256 totalPayment = 0;
    uint256 totalRefund = 0;
    for (uint256 i = 0; i < tokensToAdd.length; i++) {
      address token = tokensToAdd[i];
      uint256 curTokenFunds = sp_inheritanceFunds.forTokensValue[token];
      if (fundsPerToken > curTokenFunds) {
        //need to increase funds in sp_inheritanceFunds.forTokensValue[tokens[i]]
        uint256 increaseFunds = fundsPerToken - curTokenFunds;
        sp_inheritanceFunds.forTokensValue[token] += increaseFunds;
        totalPayment += increaseFunds;
      } else if (fundsPerToken < curTokenFunds) {
        //need to get back funds from sp_inheritanceFunds.forEtherValue
        uint256 decreaseFunds = curTokenFunds - fundsPerToken;
        sp_inheritanceFunds.forTokensValue[token] -= decreaseFunds;
        totalRefund += decreaseFunds;
      }
      if (fundsPerToken != curTokenFunds) {
        emit TokenInheritanceFundsUpdated(vaultOwner, msg.sender, token, UPDATED, curTokenFunds, fundsPerToken);
      }
    }
    for (uint256 i = 0; i < tokensToRemove.length; i++) {
      address token = tokensToRemove[i];
      uint256 curTokenFunds = sp_inheritanceFunds.forTokensValue[token];
      sp_inheritanceFunds.forTokensValue[token] = 0;
      totalRefund += curTokenFunds;
      if (curTokenFunds > 0) {
        emit TokenInheritanceFundsUpdated(vaultOwner, msg.sender, token, UPDATED, curTokenFunds, 0);
      }
    }
    return (totalPayment, totalRefund);
  }    

  /** @dev activates a inheritance transaction for tokens
      the function checks that the activator meets the requirments (has a vault and kiro)
      then it activates the trx and gets the funds for the action he did (in kiro) 
      @param vault address that the inheritance trx is for
      @param token token to send to heirs
  */
  function activateTokenInheritance(address vault, address token) external override rateLimit {
    address beneficiary = getBeneficiary(s_tokenInheritanceRequirements);
    if (IHeritable(vault).activateTokenInheritance(token)) {
      InheritanceFunds storage sp_funds = s_inheritanceFunds[vault];
      uint256 funds = sp_funds.forTokensValue[token];
      if (funds > 0) {
        IERC20(s_kiro).safeTransfer(beneficiary, funds);
        sp_funds.forTokensValue[token] = 0;
        emit TokenInheritanceFundsUpdated(msg.sender, vault, token, ACTIVATED, funds, 0);
      }
    }
  }

  function migrateTokenInheritance(address vaultOwner, address from, address[] calldata tokens)
    external
    override
  {
    address vault = IFactory(s_factory).getWallet(vaultOwner);
    address activator = IOracle(IWallet(vault).oracle()).activator();
    require(from != activator, 'same version');
    if (address(this) == activator) {
      address[] memory oneToken = new address[](1);
      for (uint256 i = 0; i < tokens.length; i++) {
        address token = tokens[i];
        uint256 curBalance = IERC20(s_kiro).balanceOf(address(this));
        oneToken[0] = token;
        IInheritancePayment(from).migrateTokenInheritance(vaultOwner, from, oneToken);
        uint256 balanceDelta = IERC20(s_kiro).balanceOf(address(this)) - curBalance;
        s_inheritanceFunds[vault].forTokensValue[token] += balanceDelta;
      } 
    } else if (msg.sender == activator) {
      require(tokens.length == 1);
      address token = tokens[0];
      uint256 value = s_inheritanceFunds[vault].forTokensValue[token];
      s_inheritanceFunds[vault].forTokensValue[token] = 0;
      IERC20(s_kiro).safeTransfer(activator, value);
    }
  }

  function updateAllInheritanceFunds(
    address vaultOwner,
    uint256 funds,
    address[] calldata tokensToAdd,
    address[] calldata tokensToRemove,
    uint256 fundsPerToken
  ) public override
    onlyVaultOfOwner(vaultOwner)
  {
    (uint256 payment1, uint256 refund1) = _updateInheritanceFunds(vaultOwner, funds);
    (uint256 payment2, uint256 refund2) = _updateTokenInheritanceFunds(vaultOwner, tokensToAdd, tokensToRemove, fundsPerToken);
    _syncFunds(payment1 + payment2, refund1 + refund2);
  }

function updateAllFunds(
    address vaultOwner,
    uint256 backupFunds,
    uint256 inheritanceFunds,
    address[] calldata tokensToAdd,
    address[] calldata tokensToRemove,
    uint256 fundsPerToken
  ) public override
    onlyVaultOfOwner(vaultOwner)
  {
    (uint256 payment1, uint256 refund1) = _updateBackupFunds(vaultOwner, backupFunds);
    (uint256 payment2, uint256 refund2) = _updateInheritanceFunds(vaultOwner, inheritanceFunds);
    (uint256 payment3, uint256 refund3) = _updateTokenInheritanceFunds(vaultOwner, tokensToAdd, tokensToRemove, fundsPerToken);
    _syncFunds(payment1 + payment2 + payment3, refund1 + refund2 + refund3);
  }

  function _syncFunds(uint256 payment, uint256 refund) private {
    if (payment > refund) {
        IERC20(s_kiro).safeTransferFrom(msg.sender, address(this), payment - refund);
    } else if (payment < refund) {
        IERC20(s_kiro).safeTransfer(msg.sender, refund - payment);
    }
  }

}
