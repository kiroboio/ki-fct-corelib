// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-solidity/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/IBackupable.sol";
import "../interfaces/IOracle.sol";
import "../interfaces/ITokenEconomy.sol";
import "./Interface.sol";
import "./StorageBase.sol";
import "./Storage.sol";

// uint256 constant CALL_GAS = 200000;

/** @title Backupable contract
    @author Tal Asa <tal@kirobo.io> 
    @notice Backupable contract intreduces the functionality of backup wallet.
            An owner of the wallet can set a different wallet as a backup wallet.
            After activation and time setting the wallet ownership can be reclaimed by
            the backup wallet owner
 */
abstract contract Backupable is IBackupable, StorageBase, Storage {
  using SafeERC20 for IERC20;
  uint256 constant MAX_FEES = 2 ** 196;

  event BackupChanged(
    address indexed creator,
    address indexed owner,
    address indexed wallet,
    uint32 timeout,
    uint40 timestamp,
    uint8 state
  );
  event BackupRemoved(
    address indexed creator,
    address indexed owner,
    address indexed wallet,
    uint8 state
  );
  event BackupRegistered(
    address indexed creator,
    address indexed wallet,
    uint8 state
  );
  event BackupEnabled(
    address indexed creator,
    address indexed wallet,
    uint40 timestamp,
    uint8 state
  );
  event BackupActivated(
    address indexed creator,
    address indexed wallet,
    address indexed activator,
    uint8 state
  );
  event BackupPayment(
    address indexed creator,
    address indexed payee,
    address indexed token,
    uint256 amount,
    bool reported
  );
  event OwnershipTransferred(
    address indexed creator,
    address indexed previousOwner,
    address indexed newOwner,
    uint8 state
  );
  event OwnershipReclaimed(
    address indexed creator,
    address indexed owner,
    address indexed pendingOwner,
    uint8 state
  );

  modifier onlyActiveOwner() {
    require(
      msg.sender == s_owner && s_backup.state != BACKUP_STATE_ACTIVATED,
      "not active owner"
    );
    _;
  }

  modifier onlyBackup() {
    require(msg.sender == s_backup.wallet, "not backup");
    _;
  }

  modifier eitherOwnerOrBackup() {
    require(
      msg.sender == s_owner || msg.sender == s_backup.wallet,
      "neither owner nor backup"
    );
    _;
  }

  /**@dev backwords competabillity */
  function setBackup(address wallet, uint32 timeout) external onlyActiveOwner {
    setBackupAndPayment(wallet, timeout, 0);
  }  

  /** @notice this function sets the backup wallet to a specific activeOwner
        @param wallet: (type address) - backup wallet address
        @param timeout (type uint32) - timeout in seconds 
        @param minFee (type uint256) - the amount of funds the user wants to set for the activator
        Requirements: 1. must enter a wallet address
                      2. owner wallet address must be different then the backup wallet address
     
        Caution: this operation will override the previous backup wallet
     */
  function setBackupAndPayment(address wallet, uint32 timeout, uint256 minFee) public onlyActiveOwner {
    require(wallet != address(0), "must enter a valid wallet address");
    require(wallet != s_owner, "backup is owner");
    require(timeout != 0, "must enter valid timeout");

    _payBackupFees(minFee);

    if (s_backup.wallet != wallet) {
      if (s_backup.wallet != address(0)) {
        ICreator(this.creator()).removeWalletBackup(s_backup.wallet);
      }
      s_backup.wallet = wallet;
      ICreator(this.creator()).addWalletBackup(wallet);
      if (s_backup.state != BACKUP_STATE_PENDING)
        s_backup.state = BACKUP_STATE_PENDING;
      if (s_backup.timestamp != 0) s_backup.timestamp = 0;
    }
    if (s_backup.timeout != timeout) s_backup.timeout = timeout;
    if (s_backup.state == BACKUP_STATE_ENABLED) {
      s_backup.timestamp = getBlockTimestamp();
    }
    emit BackupChanged(
      this.creator(),
      s_owner,
      wallet,
      timeout,
      s_backup.timestamp,
      s_backup.state
    );
  }

/**@dev updates the backup payment to the activator
  the user that sets the backup can update the fee (up/down) and the fees will be reducesed or increesed
  @param minFee the new fee requested by the user (that sets the backup) */
  function updateBackupPayment(uint256 minFee) external onlyActiveOwner {
    require(s_backup.wallet != address(0), "backup not exist");
    _payBackupFees(minFee);
  }  

  /** @notice removes the owner's backup wallet
   */
  function removeBackup() external onlyOwner {
    require(s_backup.wallet != address(0), "backup not exist");
    _removeBackup();
  }

  /** @notice activates backup wallet
        conditions: 1. backup is enabled
                    2. backup wallet needs to be set
                    3. backup time that was set is now 0
     */
  function activateBackup() external override {
    require(s_backup.state == BACKUP_STATE_ENABLED, "backup not enabled");
    require(s_backup.wallet != address(0), "backup not exist");
    require(getBackupTimeLeft() == 0, "too early");
    //require (msg.sender == tx.origin);

    if (s_backup.state != BACKUP_STATE_ACTIVATED)
      s_backup.state = BACKUP_STATE_ACTIVATED;
    emit BackupActivated(
      this.creator(),
      s_backup.wallet,
      msg.sender,
      s_backup.state
    );
  }

  /** @notice once a backup wallet was activated the ownership of the original wallet needs to be
        claimed by the owner of the backup wallet
        restrictions: 1. only the backup wallet owner can claim the original wallet
                      2. backup status needs to be active
     */
  function claimOwnership() external onlyBackup {
    require(s_backup.state == BACKUP_STATE_ACTIVATED, "backup not activated");
    s_backup.state = BACKUP_STATE_PENDING;
    emit OwnershipTransferred(
      this.creator(),
      s_owner,
      s_backup.wallet,
      s_backup.state
    );
    if (s_owner != s_backup.wallet)
      ICreator(this.creator()).transferWalletOwnership(s_backup.wallet);
    s_backup.wallet = address(0);
    if (s_backup.timeout != 0) s_backup.timeout = 0;
    if (s_backup.timestamp != 0) s_backup.timestamp = 0;
  }

  /** @notice the owner that created the backup wallet can reclaim the account back
        restrictions: 1. only the original wallet owner can reclaim his original wallet
                      2. backup status needs to be active
     */
  function reclaimOwnership() external onlyOwner {
    require(s_backup.state == BACKUP_STATE_ACTIVATED, "backup not activated");
    s_backup.state = BACKUP_STATE_REGISTERED;
    emit OwnershipReclaimed(
      this.creator(),
      s_owner,
      s_backup.wallet,
      s_backup.state
    );
  }

  /** @notice sets the status of the backup to be enabled
        can be triggered by the owner or by the backup    
     */
  function enable() external eitherOwnerOrBackup {
    require(s_backup.state == BACKUP_STATE_REGISTERED, "backup not registered");
    uint40 timestamp = getBlockTimestamp();
    s_backup.state = BACKUP_STATE_ENABLED;
    s_backup.timestamp = timestamp;
    emit BackupEnabled(
      this.creator(),
      s_backup.wallet,
      timestamp,
      s_backup.state
    );
  }

  /** @notice sets the status of the backup to registered if the status was pending
   */
  function accept() external onlyBackup {
    require(s_backup.state == BACKUP_STATE_PENDING, "backup not pending");
    s_backup.state = BACKUP_STATE_REGISTERED;
    emit BackupRegistered(this.creator(), s_backup.wallet, s_backup.state);
  }

/** @notice the address that was set as the backup can decline being the backup
and in this case the backup is removed and needs to be set from the begining*/
  function decline() external onlyBackup {
    require(s_backup.state == BACKUP_STATE_PENDING, "backup not pending");
    _removeBackup();
  }

  function getBackupState() external view returns (uint8) {
    return s_backup.state;
  }

  function getBackupWallet() external view returns (address) {
    return s_backup.wallet;
  }

  function isOwner() external view returns (bool) {
    return (s_owner == msg.sender);
  }

  function isBackup() external view returns (bool) {
    return (s_backup.wallet == msg.sender);
  }

  function getBackupTimeout() external view returns (uint40) {
    return s_backup.timeout;
  }

  function getBackupTimestamp() external view returns (uint40) {
    return s_backup.timestamp;
  }

  function isActiveOwner(address account) external view returns (bool) {
    return account == s_owner && s_backup.state != BACKUP_STATE_ACTIVATED;
  }

  /** @notice checks the time left until the backup can be activated
        @return res (uint40) - time left in seconds untill the backup is enabled or 0
                    if the time has passed
    */
  function getBackupTimeLeft() public view returns (uint40 res) {
    unchecked {
      uint40 timestamp = getBlockTimestamp();
      if (
        s_backup.timestamp > 0 &&
        timestamp >= s_backup.timestamp &&
        s_backup.timeout > timestamp - s_backup.timestamp
      ) {
        res = s_backup.timeout - (timestamp - s_backup.timestamp);
      }
    }
  }

  function getBlockTimestamp() internal view returns (uint40) {
    // solium-disable-next-line security/no-block-members
    return uint40(block.timestamp); //safe for next 34K years
  }

  /**@dev removes the backup and sets all the relevent params to 0 */
  function _removeBackup() private {
    address backup = s_backup.wallet;
    if (backup != address(0)) {
      ICreator(this.creator()).removeWalletBackup(backup);
      s_backup.wallet = address(0);
    }
    if (s_backup.timeout != 0) s_backup.timeout = 0;
    if (s_backup.timestamp != 0) s_backup.timestamp = 0;
    if (s_backup.state != BACKUP_STATE_PENDING) {
      s_backup.state = BACKUP_STATE_PENDING;
    }
    address activator = IOracle(ICreator(this.creator()).oracle()).activator();
    IBackupPayment(activator).updateBackupFunds(s_owner, 0);
    emit BackupRemoved(this.creator(), s_owner, backup, s_backup.state);
  }

  /**@dev this function gets a struct from the activator containing the following:
    1. payer for the fees
    2. fees needed according to the use case (update/create)
    3. kiro address 
    
    then it checks the allowance and approves the transfer and calls the payForBackup function
    @param minFee create */
  function _payBackupFees(uint256 minFee) private {
    address activator = IOracle(ICreator(this.creator()).oracle()).activator();
    IActivator.Fees memory feesData = IActivator(activator).getBackupFees();
    uint256 fee = minFee >= feesData.fee ? minFee : feesData.fee;

    if (fee > 0) {
      if (IERC20(feesData.kiro).allowance(address(this), activator) < fee) {
        IERC20(feesData.kiro).approve(activator, MAX_FEES);
      }
    }
    IBackupPayment(activator).updateBackupFunds(s_owner, fee);
    emit BackupPayment(
      this.creator(),
      activator,
      feesData.kiro,
      fee,
      true
    );    
  }

}
