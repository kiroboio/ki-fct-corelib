// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/** @notice NFT minter contract
this contract is the minter for the Kirobo utility NFT */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../interfaces/IKiroboNFT.sol";
import "../interfaces/IFactory.sol";
import "../interfaces/IWallet.sol";

contract Minter is AccessControl {
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  uint8 public constant BACKUP_STATE_ENABLED = 2;
  uint256[] private collection;
  using SafeERC20 for IERC20;
  using Address for address;

  uint256 private s_startTime;
  uint256 private s_endTime;
  uint256 private s_preSaleEndTime;
  uint256 private s_nftPrice;
  uint256 private s_preSalePrice;
  uint256 private s_kirobrosPrice;
  uint256 private s_backupDiscount;
  uint256 private s_inheritanceDiscount;
  uint256 private s_minHoldingForDiscount;
  uint256 private s_maxHoldingForDiscount;
  uint256 private s_holdingDiscount;
  address private s_nftAddress;
  address private s_factoryAddress;

  mapping(uint256 => string) private s_idToUri;
  mapping(address => uint256) private s_whitelist;
  mapping(address => uint256) private s_kirobros;

    address public immutable KIRO_ADDRESS;

  event TransferSent(address indexed from, address indexed to, uint256 indexed amount);

  /** @notice constractor
    @param factoryAddress the factory address */
  constructor(address factoryAddress, address kiroAddress) {
    s_factoryAddress = factoryAddress;
    _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    _grantRole(MINTER_ROLE, _msgSender());

    KIRO_ADDRESS = kiroAddress;
  }

  /** @notice mint function will randomly preduce an NFT from the Kirobo NFT collection
    @dev the function will do the following:
    1. mint period started
    2. mint period is not over
    3. address that requested the mint is a kirobo vault address
    4. there are still NFT's left in the collection
    5. preduce a random NFT from the collection
    6. calculate a price according to WL/s_kirobros list and presale time
    7. check payment is sufficient
    8. returns funds if too much funds were sent
    9. emits a transfer msg
    10. mints an NFT
    11. removes the minted item from the collection */
  function mint() external payable returns (uint256 id) {
    require(block.timestamp >= s_startTime, "Mint Time Didn't start yet");
    require(block.timestamp <= s_endTime, "Mint time is over");
    address initiator = msg.sender;
    address wallet = IFactory(s_factoryAddress).getWalletOfOwner(msg.sender);
    if (wallet == address(0)) {
      initiator = IWallet(msg.sender).owner();
      wallet = IFactory(s_factoryAddress).getWalletOfOwner(initiator);
      require(wallet == msg.sender, "not vault owner");
    }
    require(wallet != address(0), "No Vault");
    require(collection.length > 0, "No Items left for sale");
    uint256 index = (random() % collection.length);
    id = collection[index];
    require(id != 0, "No item found in array");
    uint256 nftPrice = calcPrice(initiator);
    if (s_kirobros[initiator] >= 1) {
      s_kirobros[initiator] -= 1;
    } else if (s_whitelist[initiator] >= 1) {
      s_whitelist[initiator] -= 1;
    }

    require(msg.value >= nftPrice, "Insufficient payment");

    removeFromCollection(index);
    // refund if customer paid more than the cost to mint
    if (msg.value > nftPrice) {
      Address.sendValue(payable(initiator), msg.value - nftPrice);
    }

    INFT(s_nftAddress).mint(wallet, id, s_idToUri[id]);
    emit TransferSent(wallet, address(this), nftPrice);
  }

  /** @dev setting some mint related params
    @param startTime the mint start time
    @param endTime the mint end time
    @param nftPrice regular price of NFT
    @param preSalePrice price for WL members
    @param kirobrosPrice price for s_kirobros
    @param presaleEndTime presale end time 
    @param backupDiscount discount amount for having backup in Enable state
    @param inheritanceDiscount discount amount for having inheritance
    @param minHoldingForDiscount kiro minimum holdings for getting a discount
    @param maxHoldingForDiscount kiro max holding for receiveng the max discount
    @param holdingDiscount discount amount for kiro holding*/
  function setMint(
    uint256 startTime,
    uint256 endTime,
    uint256 nftPrice,
    uint256 preSalePrice,
    uint256 kirobrosPrice,
    uint256 presaleEndTime,
    uint256 backupDiscount,
    uint256 inheritanceDiscount,
    uint256 minHoldingForDiscount,
    uint256 maxHoldingForDiscount,
    uint256 holdingDiscount
  ) external onlyRole(MINTER_ROLE) {
    s_startTime = startTime;
    s_endTime = endTime;
    s_nftPrice = nftPrice;
    s_preSalePrice = preSalePrice;
    s_kirobrosPrice = kirobrosPrice;
    s_preSaleEndTime = presaleEndTime;
    s_backupDiscount = backupDiscount;
    s_inheritanceDiscount = inheritanceDiscount;
    s_minHoldingForDiscount = minHoldingForDiscount;
    s_maxHoldingForDiscount = maxHoldingForDiscount;
    s_holdingDiscount = holdingDiscount;
  }

  /** @dev removing an item from the collection
    @param i_index index in the array for the wanted item to be removed */
  function externalRemoveFromCollection(uint256 i_index)
    external
    onlyRole(MINTER_ROLE)
  {
    require(collection[i_index] != 0, "Item doesn't exists");
    removeFromCollection(i_index);
  }

  /** @notice inserts an address to the minter s_whitelist
    @param input address to add to the WL 
    @param amount how many times can this address mint for WL */
  function insertToWhitelist(address input, uint256 amount) external onlyRole(MINTER_ROLE) {
    s_whitelist[input] = amount;
  }

  /** @notice removes an address from the WL
    @param input address to remove from WL */
  function removeFromWhitelist(address input) external onlyRole(MINTER_ROLE) {
    s_whitelist[input] = 0;
  }

  /** @notice s_kirobros will be addresss that will be able to mint for free
    @param input address to add to s_kirobros list
    @param amount how many times can this address mint for free */
  function insertToKirobros(address input, uint256 amount)
    external
    onlyRole(MINTER_ROLE)
  {
    s_kirobros[input] = amount;
  }

  /** @notice removes an address from the s_kirobros list
    @param input address to remove from s_kirobros list */
  function removeFromKirobros(address input) external onlyRole(MINTER_ROLE) {
    s_kirobros[input] = 0;
  }

  /** @notice updates the NFT contrat address
    @param nftAddress addrsss of NFT contract */
  function updateNFTAddress(address nftAddress) external onlyRole(MINTER_ROLE) {
    s_nftAddress = nftAddress;
  }

  function getNFTAddress() external view returns (address) {
    return s_nftAddress;
  }

  /** @notice a function that adds an item to the collection
    @param i_id the NFT id to be added
    @param i_uri the uri string for the NFT picture */
  function addToCollection(uint256 i_id, string memory i_uri)
    external
    onlyRole(MINTER_ROLE)
  {
    collection.push(i_id);
    s_idToUri[i_id] = i_uri; //ipfs address of the NFT picture
  }

  /** @dev a function that can move an amount of the funds to a payable address
    @param amount to be withdrawed
    @param to address to send the funds */
  function withdraw(uint256 amount, address payable to)
    external
    onlyRole(MINTER_ROLE)
  {
    require(amount <= address(this).balance, "insufficient funds");
    payable(to).transfer(amount);
    emit TransferSent(msg.sender, to, amount);
  }

  /** @dev a function that can move all the funds to a payable address
    @param to address to send the funds */
  function withdrawAll(address payable to) external onlyRole(MINTER_ROLE) {
    require(0 < address(this).balance, "no ETH left in the contract");
    payable(to).transfer(address(this).balance);
    emit TransferSent(msg.sender, to, address(this).balance);
  }

  /** @notice checks if a given address is in the WL, return bool
    @param input address to check */
  function checkIfInWhitelist(address input) external view returns (bool res) {
    res = s_whitelist[input] > 0 ? true: false;
  }

  /** @notice a public function that returns all the items in the collection */
  function getCollection() external view returns (uint256[] memory) {
    return collection;
  }

  /** @notice checks if a given address is in the s_kirobros list
    returns the number of mints left
    @param input address to check */
  function checkAmountInKirobros(address input)
    external
    view
    returns (uint256 res)
  {
    return s_kirobros[input];
  }

  /** @notice function that returns some info to a specific address
    the price that the mint will cost and start and end times */
  function getMintInfo()
    external
    view
    returns (
      uint256 startTime,
      uint256 endTime,
      uint256 presaleEndTime,
      uint256 nftPrice,
      uint256 kirobrosPrice,
      uint256 preSalePrice,
      uint256 backupDiscount,
      uint256 inheritanceDiscount,
      uint256 minHoldingForDiscount,
      uint256 maxHoldingForDiscount,
      uint256 holdingDiscount
    )
  {
    startTime = s_startTime;
    endTime = s_endTime;
    presaleEndTime = s_preSaleEndTime;
    nftPrice = s_nftPrice;
    kirobrosPrice = s_kirobrosPrice;
    preSalePrice = s_preSalePrice;
    backupDiscount = s_backupDiscount;
    inheritanceDiscount = s_inheritanceDiscount;
    minHoldingForDiscount = s_minHoldingForDiscount;
    maxHoldingForDiscount = s_maxHoldingForDiscount;
    holdingDiscount = s_holdingDiscount;
  }

  /** @dev internal function to remove an item from the collection
    @param i_index index in the array for the wanted item to be removed */
  function removeFromCollection(uint256 i_index) internal {
    if (i_index < collection.length - 1) {
      collection[i_index] = collection[collection.length - 1];
    }

    collection.pop();
  }

  /** @dev caculation of discount according to 3 parameters:
  having a backup Enabled, having an inheritance set, amount of kiro in the vault
  @param vault address of the vault
  @param startPrice the prices before the discounts */
  function discountsCalc(address vault, uint256 startPrice) internal view returns(uint256 newPrice){
    newPrice = startPrice;
    uint256 discount;
    if(IWallet(vault).getBackupState() == BACKUP_STATE_ENABLED){
      discount += s_backupDiscount;
    }
    if(IWallet(vault).isInheritanceEnabled()){
      discount += s_inheritanceDiscount;
    }

    uint256 holdingAmount = IERC20(KIRO_ADDRESS).balanceOf(vault);
    if(holdingAmount >= s_maxHoldingForDiscount){
      discount += s_holdingDiscount;
    } else if(holdingAmount > s_minHoldingForDiscount){
      discount += ((holdingAmount - s_minHoldingForDiscount) * s_holdingDiscount) / (s_maxHoldingForDiscount - s_minHoldingForDiscount);
    }
    newPrice = newPrice > discount ? (newPrice - discount) : 0;
  }

  /** @notice a function that calculates the price according to the address of the sender
    @dev the function checks the msg.sender of the mint againt
    the time and WL/s_kirobros lists, and gives a price 
    @param account vault owner address*/
  function calcPrice(address account) public view returns (uint256 price) {
    price = s_nftPrice;
    address wallet = IFactory(s_factoryAddress).getWalletOfOwner(account);
    if (block.timestamp <= s_preSaleEndTime && block.timestamp >= s_startTime) {
      require(
        s_whitelist[account] >= 1 || s_kirobros[account] >= 1,
        "Auction in presale is for s_whitelist/s_kirobros invites only"
      );
      if (s_kirobros[account] >= 1) {
        price = s_kirobrosPrice;
      } else {
        if(wallet != address(0)){
          price = discountsCalc(wallet, s_preSalePrice);
        }
      }
    } else if (block.timestamp > s_preSaleEndTime && block.timestamp <= s_endTime) {
      if (s_kirobros[account] >= 1) {
        price = s_kirobrosPrice;
      }
      else if(wallet != address(0)){
        price = discountsCalc(wallet, s_nftPrice);
      }
    }
  }

  /** @notice function that calculates some random uint that will be
    used to get a random NFT from the NFT collection */
  function random() internal view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(block.difficulty, block.number)));
  }
}
