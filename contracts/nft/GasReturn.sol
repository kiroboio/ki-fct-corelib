// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

/** @notice Kirobo Gas return contract
--------------------------------------
Kirobo introduced a utility NFT that returns gas fees
for the use of DEFI from her liquid vault, this contract along side 
with the NFT contract will hold the relevet gas reimbursment that is assigned 
to each NFT

this contract also hosts the activity game introduced by kirobo
this game will allow the users to gain even more reimbursment to their NFT
while using the kirobo liquid vault
*/

import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-solidity/contracts/access/AccessControl.sol";
import '../uniswap-oracle/UniswapV2OracleLibrary.sol';
import '../uniswap-oracle/IUniswapV2Factory.sol';
import "../interfaces/IFactory.sol";
import "../interfaces/IWallet.sol";

contract GasReturn is AccessControl {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;
  using FixedPoint for *;
  uint256 private s_stakingAmountNeeded;
  uint256 private s_timeBetweenKiroPriceUpdate = 24 hours;
  uint256 public s_lastUpdateDateOfPrice;
  address private s_factory;
  uint256 private s_key;
  uint256[] private s_kiroHoldingArray;
  uint256 private s_kiroHoldingJumps;
  uint256[36] private s_timeArray;
  uint256 private s_timeReference;
  address private s_nftContractAddress;
  uint256[] private s_nftAmountArray;
  uint256 private s_numberOfDaystoCollect = 1;
  uint    public price0CumulativeLast;
  uint    public price1CumulativeLast;
  uint32  public blockTimestampLast;
  FixedPoint.uq112x112 public price0Average;
  FixedPoint.uq112x112 public price1Average;

  uint256 private constant PERCENTAGE_MULTIPLIER = 10000;
  uint256 private constant BIT_TIME_OFFSET = 8;
  uint256 private constant DAYS_IN_UINT256 = 32;
  uint256 private constant COLLECT_STATUS_NO_REQUEST = 0;
  uint256 private constant COLLECT_STATUS_PENDING = 1;
  uint256 private constant COLLECT_STATUS_APPROVED = 2;
  uint256 private constant HIGHEST_NFT_WORTH = 1000000000000000000000000;
  uint256 private constant DECIMAL = 1000000000000000000;
  uint8 private constant BACKUP_STATE_ACTIVATED = 3;    
  // keccak256("OPERATOR_ROLE");
  bytes32 public constant OPERATOR_ROLE =
    0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929;
  // keccak256("DAO_ROLE");
  bytes32 public constant DAO_ROLE =
    0x3b5d4cc60d3ec3516ee8ae083bd60934f6eb2a6c54b1229985c41bfb092b2603;
  address public immutable KIRO_ADDRESS; // =
    //0xB1191F691A355b43542Bea9B8847bc73e7Abb137;
  IUniswapV2Pair immutable pair;
  address public immutable token0;
  address public immutable token1;
  
  mapping(uint256 => uint256) private s_totalActionsPerMonth;
  mapping(address => uint256) private s_whitelist;
  mapping(uint256 => uint256) private s_idToMaxGasReturn;
  mapping(uint256 => uint256) private s_idToUsedGasReturn;
  mapping(uint256 => uint256) private s_idToCollectedGas;
  mapping(uint256 => uint256) private s_idToClosedMonth;
  mapping(uint256 => uint256) private s_prizePerMonth;
  mapping(uint256 => mapping(uint256 => uint256)) private s_idAndMonthToActionsCount;
  mapping(uint256 => bytes32) private s_idToHash;
  mapping(uint256 => uint256) private s_idToCollectTime;

  event TransferSent(address indexed from, address indexed to, uint256 indexed amount);
  event HoldingAmountUpdate(uint256 indexed amount);
  event prizePerMonthUpdate(uint256 indexed month, uint256 indexed amount);

  modifier onlyOperator() {
    require(hasRole(OPERATOR_ROLE, msg.sender), "GasReturn: not an activator");
    _;
  }

  /** @notice constractor
    @param activator the activator address
    @param factory the factory address
    @param kiroAddress kiro token address
    @param pairAddress the kiro-weth pair address*/
  constructor(address activator, address factory, address kiroAddress, address pairAddress) {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(OPERATOR_ROLE, msg.sender);
    _grantRole(OPERATOR_ROLE, activator);

    s_factory = factory;
    KIRO_ADDRESS = kiroAddress;

    IUniswapV2Pair _pair = IUniswapV2Pair(pairAddress);
    pair = _pair;
    token0 = _pair.token0();
    token1 = _pair.token1();
    price0CumulativeLast = _pair.price0CumulativeLast(); // fetch the current accumulated price value (1 / 0)
    price1CumulativeLast = _pair.price1CumulativeLast(); // fetch the current accumulated price value (0 / 1)
    uint112 reserve0;
    uint112 reserve1;
    (reserve0, reserve1, blockTimestampLast) = _pair.getReserves();
    require(reserve0 != 0 && reserve1 != 0, 'NO_RESERVES'); // ensure that there's liquidity in the pair
  }

  /** @dev this will update the NFT address in the gas return contract
  @param input NFT address*/
  function setNFTContractAddress(address input) external onlyOperator {
    s_nftContractAddress = input;
  }

  /**@dev this function sets a specific hash for each NFT
  this hash is a combination of the id a key and the amount stored in the NFT 
  after the reveal the key will be updated in the contract and the hash will be
  able to be compared to the calculated hash (in revealGasReturn function)
  @param i_nftId nft id
  @param i_hash hash (in hex) made up of the id, key and amount
  ie : if i want to hash nft id 12 with key 123456 and amount 5000 kiro
  i will build the following:
  000000000000000000000000000000000000000000000000000000000000000C
  000000000000000000000000000000000000000000000000000000000001e240
  0000000000000000000000000000000000000000000000000000000000001388
  hashing it with Keccak-256 it will give us the following hash:
  53c3b593780f351beb2ac6822082af0bf1e015ca8c91b3b9c957ba7c9e0a8097 
  */
  function setHashMapping(uint256 i_nftId, bytes32 i_hash)
    external
    onlyOperator
  {
    s_idToHash[i_nftId] = i_hash;
  }

  /**@dev returns the current loaded gas to be used assosiated with the input nft id
  @param i_nftId the nft id */
  function getNFTGasReturnAmount(uint256 i_nftId)
    external
    view
    returns (uint256 gasReturn)
  {
    gasReturn = s_idToMaxGasReturn[i_nftId];
  }

  /**@dev returns the used assosiated with the input nft id
  @param i_nftId the nft id */
  function getNFTGasUsedAmount(uint256 i_nftId)
    external
    view
    returns (uint256 gasUsed)
  {
    gasUsed = s_idToUsedGasReturn[i_nftId];
  }

  /**@notice this function will update the prize kirobo is giving for each month in the game
  @param i_month the specific month
  @param i_prize prize for this month
  ie: 2, 300000*/
  function updatePrizePerMonth(uint256 i_month, uint256 i_prize)
    external
    onlyOperator
  {
    s_prizePerMonth[i_month] += i_prize;
    emit prizePerMonthUpdate(i_month, i_prize);
  }

  function getPrizePerMonth(uint256 month) external view returns(uint256)
  {
    return s_prizePerMonth[month];
  }

  /**@dev setting a few contract params
  @param kiroHoldingArray this array will help caculate the 
        multiplier for holding kiro in the vault 
        ie: [10000, 15000,25000,25000,40000,40000,40000,40000,40000,40000,60000,60000]
  @param kiroHoldingJumps with the array this number will give the holding multiplier
    ie: 5000 (the calulation will be explaind in function calcKiroHoldingScore)*/
  function setContractParams(
    uint256[] memory kiroHoldingArray,
    uint256 kiroHoldingJumps  
  ) external onlyOperator {
    s_kiroHoldingArray = kiroHoldingArray;
    s_kiroHoldingJumps = kiroHoldingJumps;
  }

  /**@dev sets the time array
  @param input ie: ["0x101010101010101010101010101010101010101010101010101010101010102",
                    "0x202020202020202020202020202020202020202020202020202020203030303"
                    ... 
                    
          in this example in index 0 we can see that 31 days (31*8 first bits) 
          are pointing to month 1 and the 32nd bit 8 is pointing to month 2, 
          so it's a month that has 31 days*/
  function setTimeArray(uint256[36] memory input) external onlyOperator {
    s_timeArray = input;
  }

  /**@dev updates the time reference 
  @param time the time of the start of the gas return activity */
  function updateTimeReference(uint256 time) external onlyOperator {
    s_timeReference = time;
  }

  /**@dev inerting an address to WL
  this is another multioplier for the game,
  if the user is using an address in the WL to interact with his score 
  will be multiplied by the score assosiated with this address 
  @param input address
  @param score for this address*/
  function insertToWhitelist(address input, uint256 score)
    external
    onlyOperator
  {
    s_whitelist[input] = score;
  }

  /**@dev gets an address in thw WL's score 
  @param input address
  @return score number of mints left for the input address*/
  function getWhitelistScore(address input)
    external
    view
    returns (uint256 score)
  {
    score = s_whitelist[input];
  }

  /**@dev remove an address from the WL 
  @param input address*/
  function removeFromWhitelist(address input) external onlyOperator {
    delete s_whitelist[input];
  }

  /**@dev updates the needed kiro in the vault in order to get the gas fees back 
  @param newStakingAmountNeeded amount in kiro*/
  function updateHoldingAmountNeeded(uint256 newStakingAmountNeeded)
    external
    onlyOperator
  {
    s_stakingAmountNeeded = newStakingAmountNeeded;
    emit HoldingAmountUpdate(newStakingAmountNeeded);
  }

  /**@dev updates the time required between kiro price update 
  @param time in seconds */
  function updateTimeBetweenKiroPriceUpdate(uint256 time)
    external
    onlyOperator
  {
    s_timeBetweenKiroPriceUpdate = time;
  }

  function getTimeBetweenKiroPriceUpdate() external view returns(uint256){
    return s_timeBetweenKiroPriceUpdate;
  }

  /**@dev this function is being called when a user does an activity in the vault
        the function will check the amount of gas that the transaction cost
        and will reimburst the gas fee according to the nft id 
        the function checks :
        1. that the trx was made from a vault
        2. that the owner of the vault is the msg.sender
        3. there is no backup activated
        4. the vault holds the NFT being used
        5. the vault has sufficient kiro in it

        then the execute2 (in the recovery wallet contract) will be called 
        in order to execute the trx
        and in the end the function will calculate the curesponfing kiro amount to reimburst 
        and the action score for this action
        @param to the address of the action
        @param value value of the trx
        @param data the data of the action
        @param nftId nft id used for reimbursment
         */
  function gasReturnExecute(
    address payable to,
    uint256 value,
    bytes calldata data,
    uint256 nftId
  ) external returns (bytes memory res) {
    uint256 gasStart = gasleft() + (data.length == 0 ? 22910 : data.length*12 + (((data.length-1)/32)*128) + 23325);
    address wallet = IFactory(s_factory).getWallet(msg.sender);
    require(wallet != address(0), "wallet address doesn't exist");
    require(
      IWallet(wallet).owner() == msg.sender,
      "vault owner is not the sender"
    );
    require(
      IWallet(wallet).getBackupState() != BACKUP_STATE_ACTIVATED,
      "vault owner is not in active state"
    );
    require(
      IERC721(s_nftContractAddress).ownerOf(nftId) == wallet,
      "vault doen't hold the NFT"
    );

    uint256 kiroInVault = IERC20(KIRO_ADDRESS).balanceOf(wallet);
    require(
      kiroInVault >= s_stakingAmountNeeded,
      "vault must hold Kiro in order to make this action"
    );
    //executing the function via the vault
    res = IWallet(wallet).execute2(to, value, data);
    //if needed, update the kiro price
    if (
      block.timestamp > s_lastUpdateDateOfPrice + s_timeBetweenKiroPriceUpdate
    ) {
      updateKiroPrice();
      s_lastUpdateDateOfPrice = block.timestamp;
    }

    uint256 month = getRelativaMonth();

    if (s_idToClosedMonth[nftId] == 0) {
      require(revealGasReturn(nftId), "No initial Gas in NFT");
    } 
    
    if (s_idToClosedMonth[nftId] < month) {
      closeMonths(nftId, month);
    }

    calcActions(kiroInVault, month, nftId, to);
    calcReward(gasStart, nftId, res.length);
  }

  /**@dev a security machanism was made in order to prevent a sele of the NFT
  and then collecting all the kiro of gas fees from this contract assosiated with the NFT id
  the mechanism works like this:
  1. you request a collect - trigger a timer 
  2. all the time the request is pending the sale of the NFT is prevented
  3. once timer ends you can claim funds and after that sell
  
  at any time until collecting the funds you can cancel the request
  @param tokenId nft id*/
  function requestToCollect(uint256 tokenId) external {
    address wallet = IFactory(s_factory).getWallet(msg.sender);
    require(wallet != address(0), "wallet address doesn't exist");
    require(
      IWallet(wallet).owner() == msg.sender,
      "vault owner is not the sender"
    );
    require(
      IWallet(wallet).getBackupState() != BACKUP_STATE_ACTIVATED,
      "vault owner is not in active state"
    );

    require(
      IERC721(s_nftContractAddress).ownerOf(tokenId) == wallet,
      "vault doen't hold the NFT"
    );
    s_idToCollectTime[tokenId] =
      block.timestamp +
      (1 days * s_numberOfDaystoCollect);
  }

  /** @dev this key is used in the construction of the hash of the 
  amounts (in the revealGasReturn function) 
  @param newKey the key ie : 123456*/
  function updateKey(uint256 newKey) external onlyOperator {
    s_key = newKey;
  }

  /** @dev this function receives the different options for NFT value for gas return
  as an array
  this will be used inorder to mask the value of the NFT until the reveal
  @param input array of nft values (ie: [100000, 50000, 20000, 10000, 5000, 2500, 2000]) */
  function setNFTAmounts(uint256[] memory input) external onlyOperator {
    s_nftAmountArray = input;
  }

  function cancelRequestToCollect(uint256 tokenId) external {
    address wallet = IFactory(s_factory).getWallet(msg.sender);
    require(wallet != address(0), "wallet address doesn't exist");
    require(
      IWallet(wallet).owner() == msg.sender,
      "vault owner is not the sender"
    );
    require(
      IWallet(wallet).getBackupState() != BACKUP_STATE_ACTIVATED,
      "vault owner is not in active state"
    );

    require(
      IERC721(s_nftContractAddress).ownerOf(tokenId) == wallet,
      "vault doen't hold the NFT"
    );
    s_idToCollectTime[tokenId] = 0;
  }

  /**@dev calculates the reward to be collected 
  checks:
  1. value requested to collect is in the contract and assosieted with this nft id
  2. the time to collect since the request passed
  3. request was made from the vault
  4. no backup activated
  5. the nft id belongs to the vault
  
  calculates the penalty and funds to collect
  burns the penalty and sends the qulify funds to the owner of the NFT*/
  function collectReward(uint256 value, uint256 nftId) external {
    require(
      value + s_idToCollectedGas[nftId] <= s_idToUsedGasReturn[nftId],
      "Not enough Kiro to collect"
    );
    require(
      block.timestamp >= s_idToCollectTime[nftId],
      "the time from the collect request didn't pass yet"
    );
    address vault = IFactory(s_factory).getWallet(msg.sender);
    require(vault != address(0), "vault address doesn't exist");
    require(
      IWallet(vault).owner() == msg.sender,
      "vault owner is not the sender"
    );
    require(
      IWallet(vault).getBackupState() != BACKUP_STATE_ACTIVATED,
      "vault owner is not in active state"
    );
    require(
      IERC721(s_nftContractAddress).ownerOf(nftId) == vault,
      "vault doen't hold the NFT"
    );
    uint256 month = getRelativaMonth();
    uint256 noPenalty = (value * month) / 36;
    uint256 penalty = value - noPenalty;
    s_idToCollectedGas[nftId] = value;
    s_idToCollectTime[nftId] = 0;
    ERC20Burnable(KIRO_ADDRESS).burn(penalty);
    IERC20(KIRO_ADDRESS).safeTransfer(vault, noPenalty);
    emit TransferSent(address(this), vault, noPenalty);
  }

  /**@dev sets the number of days from requestimg to collect since being able to collect
  (default is 1 day) 
  @param numDays number*/
  function setNumberOfDaysToCollect(uint256 numDays) external onlyOperator {
    s_numberOfDaystoCollect = numDays;
  }

   /**@dev gets how much a specific nft id has left to use in gas
    @param tokenId nft id*/
  function getGasRemaining(uint256 tokenId)
    external
    view
    returns (uint256 res)
  {
    res = s_idToMaxGasReturn[tokenId] - s_idToUsedGasReturn[tokenId];
  }

  /**@dev returns how much kiro the user can collect from the Gas return 
    contract (including penalty for early collect) 
    @param tokenId the nft id*/
  function getKiroAvailableToCollect(uint256 tokenId)
    external
    view
    returns (uint256 res)
  {
    res = s_idToUsedGasReturn[tokenId] - s_idToCollectedGas[tokenId];
  }

  function getTimeReference() external view returns (uint256){
    return s_timeReference;
  }

  function getNumberOfDaysToCollect() external view returns(uint256){
    return s_numberOfDaystoCollect;
  }

  /**@dev gets the holding amount that is needed to get fees back */
  function getHoldingAmountNeeded() external view returns (uint256) {
    return s_stakingAmountNeeded;
  }

  /**@dev returns the timeArray */
  function getTimeArray() external view returns (uint256[36] memory) {
    return s_timeArray;
  }

  /**@dev gets the hash assosiated with the NFT entered
  @param nftId the nft id*/
  function getHashForId(uint256 nftId) external view returns (bytes32) {
    return s_idToHash[nftId];
  }

  /**@dev return the action score count for a specific nft id in a specific month 
  @param nftId nft id
  @param month month to check*/
  function getActionsCount(uint256 nftId, uint256 month)
    external
    view
    returns (uint256 res)
  {
    res = s_idAndMonthToActionsCount[nftId][month];
  }

  /**@dev gets the total action score of all nft's for a specific month
    @param month month to check */
  function getTotalActionsPerMonth(uint256 month)
    external
    view
    returns (uint256 res)
  {
    res = s_totalActionsPerMonth[month];
  }

  /**@dev gets the key */
  function getKey() external view returns (uint256) {
    return s_key;
  }

  /** @dev gets the address of the NFT contract*/
  function getNFTContractAddress() external view returns (address) {
    return s_nftContractAddress;
  }

  /**@dev return the NFT amounts array */
  function getNFTAmounts() external view returns (uint256[] memory) {
    return s_nftAmountArray;
  }

  /**@dev returns the status of the collect 
    @param tokenId nft id*/
  function isRequestedToCollect(uint256 tokenId) external view returns (bool) {
    return s_idToCollectTime[tokenId] == 0 ? false : true;
  }

  /**@dev returns the amount a user can collect and receive to his balance 
  (after the penalty)
  @param nftId nft id */
  function RewardAmount(uint256 nftId) external view returns (uint256 amount) {
    uint256 month = getRelativaMonth();
    amount =
      ((s_idToUsedGasReturn[nftId] - s_idToCollectedGas[nftId]) * month) /
      36;
  }

  /**@dev this function checks when was the last time we closed a month for a specific NFT id
  if there is a gap it will call closeMonth sevral times
  @param i_nftId nft id */
  function closeMonths(uint256 i_nftId, uint256 currentMonth) internal {
    uint256 NumMonthsToUpdate = currentMonth - s_idToClosedMonth[i_nftId];

    for (uint256 i = 0; i < NumMonthsToUpdate; i++) {
      closeMonth(i_nftId, s_idToClosedMonth[i_nftId]);
    }
  }

  /**@dev this function closes a specific month for a given NFT
  closing a month means to get the game results for the closed 
  month and award the NFT with the prize earnings
  the function devides the total activity points for the NFT and devides them
  by the total activity points for all user that month
  and that is the part of the prize this NFT gets
  @param i_nftId nft id
  @param i_prevMonth the month need to close*/
  function closeMonth(uint256 i_nftId, uint256 i_prevMonth) internal {
    uint256 nftMonthlyActions = s_idAndMonthToActionsCount[i_nftId][
      i_prevMonth
    ];
    uint256 newMaxAddition;
    if(nftMonthlyActions != 0)
    {
      newMaxAddition = (nftMonthlyActions * s_prizePerMonth[i_prevMonth]) / 
        s_totalActionsPerMonth[i_prevMonth];
    }
 
    if (s_idToMaxGasReturn[i_nftId] + newMaxAddition < HIGHEST_NFT_WORTH) {
      s_idToMaxGasReturn[i_nftId] += newMaxAddition;
    } else {
      s_idToMaxGasReturn[i_nftId] = HIGHEST_NFT_WORTH;
    }
    s_idToClosedMonth[i_nftId] += 1;
    s_idAndMonthToActionsCount[i_nftId][i_prevMonth] = 0;
  }

  /**@dev reveals the gas return assosieted with the nft id 
  the reveal is a compare between a given hash
  and a caculeted hash made from nft id, key, and a return gas optional amount
  once this combination equals the given hash we have a match
  @param i_nftId nft id*/
  function revealGasReturn(uint256 i_nftId) internal returns (bool res) {
    res = false;
    bytes32 h = s_idToHash[i_nftId];
    for (uint256 i = 0; i < s_nftAmountArray.length; i++) {
      if (h == keccak256(abi.encodePacked(i_nftId, s_key, s_nftAmountArray[i]))) {
        s_idToMaxGasReturn[i_nftId] = s_nftAmountArray[i] * DECIMAL;
        s_idToClosedMonth[i_nftId] = 1;
        res = true;
        break;
      }
    }
  }

  /**@dev caculates the gas fee that will be reimburst for the action
  the total reimburst is calculated by the returnSize, that is the length of the data
  returned from the execution function in the vault
  @param gasStart how much gas was available for the transaction
  @param i_nftId nft id  
  @param returnSize the size of the returned data*/
  function calcReward(
    uint256 gasStart,
    uint256 i_nftId,
    uint256 returnSize
  ) internal {
    uint256 maxGas = s_idToMaxGasReturn[i_nftId];
    uint256 gasUsed = s_idToUsedGasReturn[i_nftId];
    require(gasUsed < maxGas, "There is no gas left on this NFT");
    //new assignment to a veriable that was 0, is more expensive then regular update
    uint256 additionalGas = gasUsed == 0 ? 11600 + 1333 : 2854 + 1333;
    if (returnSize > 0) {
        additionalGas += returnSize*3;   
    }
    //calulation the amount of gas 
    uint256 totalGas = additionalGas + gasStart - gasleft();
    //getting the amount of kiro that the gas costs
    uint256 toPayInKiro = getAmountOfKiroForGivenEth(totalGas * tx.gasprice);
    if (maxGas >= gasUsed + toPayInKiro) {
      s_idToUsedGasReturn[i_nftId] = gasUsed + toPayInKiro;
    } else {
      s_idToUsedGasReturn[i_nftId] = maxGas; //finished the NFT gas
    }
  }

  /**@dev caculated the action score given in a specific action in the vault
  @param i_kiroInVault amount of kiro held in the users vault
  @param i_currentMonth month the action was made
  @param nftId nft id
  @param to to which address the action was made (checked against the WL)*/
  function calcActions(
    uint256 i_kiroInVault,
    uint256 i_currentMonth,
    uint256 nftId,
    address to
  ) internal {
    uint256 nftMultiplier;
    uint256 whitelistScore = 1;
    if (s_idToMaxGasReturn[nftId] < HIGHEST_NFT_WORTH) {
      nftMultiplier = ((HIGHEST_NFT_WORTH * PERCENTAGE_MULTIPLIER) /
        s_idToMaxGasReturn[nftId]);
    } else {
      nftMultiplier = PERCENTAGE_MULTIPLIER;
    }
    uint256 kiroHoldingScore = calcKiroHoldingScore(i_kiroInVault);
    if (s_whitelist[to] > 0) {
      whitelistScore = s_whitelist[to];
    }
    uint256 score = (nftMultiplier * kiroHoldingScore * whitelistScore);
    s_idAndMonthToActionsCount[nftId][i_currentMonth] += score;
    s_totalActionsPerMonth[i_currentMonth] += score;
  }

  /**@notice this function checks if the time since the last update is bigger then the desired time set
              if so, the function updates the price */
  function updateKiroPrice() internal {
    (uint price0Cumulative, uint price1Cumulative, uint32 blockTimestamp) =
      UniswapV2OracleLibrary.currentCumulativePrices(address(pair));
    uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired

    // ensure that at least one full period has passed since the last update
    require(timeElapsed >= s_timeBetweenKiroPriceUpdate, 'PERIOD_NOT_ELAPSED');

    // overflow is desired, casting never truncates
    // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
    price0Average = FixedPoint.uq112x112(uint224((price0Cumulative - price0CumulativeLast) / timeElapsed));
    price1Average = FixedPoint.uq112x112(uint224((price1Cumulative - price1CumulativeLast) / timeElapsed));

    price0CumulativeLast = price0Cumulative;
    price1CumulativeLast = price1Cumulative;
    blockTimestampLast = blockTimestamp;
  }

  /**@notice this function returns the amount of kiro that is equal to the input of weth in wei
  @param amountIn the input amount in weth in wei
  this will always return 0 before update has been called successfully for the first time.*/
  function getAmountOfKiroForGivenEth(uint amountIn) public view returns (uint amountOut) {
    amountOut = price1Average.mul(amountIn).decode144();
  }

  /**@dev this function caculates the holding score, 
      this will be used as a multiplier in the action score calculation
      @param i_kiroInVault amount of kiro that is in the vault of 
              the user that used the NFT */
  function calcKiroHoldingScore(uint256 i_kiroInVault)
    public
    view
    returns (uint256 score)
  {
    if (i_kiroInVault > 0) {
      uint256 index = (i_kiroInVault / (s_kiroHoldingJumps * DECIMAL));
      if (index > s_kiroHoldingArray.length - 1) {
        score = s_kiroHoldingArray[s_kiroHoldingArray.length - 1];
      } else {
        score = s_kiroHoldingArray[index];
      }
    } else {
      score = s_kiroHoldingArray[0];
    }
  }

  /**@dev this function caculated the current month accurding to an 
    input array and a time referece to the start of the mint 
    s_timeArray holds months in an 8 bit form in a 256 uint array of 36*/
  function getRelativaMonth() public view returns (uint256 month) {
    uint256 timeDifferenceSinceStart = block.timestamp - s_timeReference;
    uint256 index = (timeDifferenceSinceStart / 1 days) / DAYS_IN_UINT256;
    uint256 remainder = ((timeDifferenceSinceStart / 1 days) % DAYS_IN_UINT256);
    if (remainder != 31) {
      month = uint8(
        s_timeArray[index] >>
          (BIT_TIME_OFFSET * (DAYS_IN_UINT256 - (remainder + 1)))
      );
    } else {
      month = uint8(s_timeArray[index]);
    }
  }
}
