// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;
/** @notice Activators contract
 */

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-solidity/contracts/access/AccessControl.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/math/Math.sol";
import "../uniswap-oracle/UniswapV2OracleLibrary.sol";
import "../uniswap-oracle/IUniswapV2Factory.sol";
import "../interfaces/IFactory.sol";
import "../interfaces/IFCT_Controller.sol";
import "../interfaces/IFCT_Activators.sol";
import "../interfaces/IWallet.sol";

import "hardhat/console.sol";

bytes32 constant NONCE_ID_MASK = 0xffffffffff0000ffffffffffff00000000000000000000000000000000000000;
bytes32 constant NONCE_MASK = 0x000000000000000000000000000000000000000000000000ffffffffffffffff;

contract FCT_Activators is /*IFCT_Activators,*/ AccessControl {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using FixedPoint for *;

    struct Activator {
      uint160 balance;
      uint40 blockNumber;
    }

    // balances
    mapping(address => Activator) public s_staked;
    mapping(address => uint256) public s_balances;
    uint256 public s_total_staked;
    
    mapping(bytes32 => address) public s_builders;
    mapping(bytes32 => uint256) public s_nonces;

    // controlled by the dao
    uint256 s_activatorShare;
    uint256 s_builderShare;
    uint256 s_baseBPS;
    uint256 s_bonusBPS;
    address s_kirobo;
    uint256 s_minActivatorStake;
        
    // token-price releated
    uint256 s_lastUpdateDateOfPrice;
    uint256 s_timeBetweenKiroPriceUpdate = 24 hours;
    uint256 public price0CumulativeLast;
    uint256 public price1CumulativeLast;
    uint32 public blockTimestampLast;
    FixedPoint.uq112x112 public price0Average;
    FixedPoint.uq112x112 public price1Average;
    IUniswapV2Pair immutable pair;
    address public immutable token0;
    address public immutable token1;

    // immutables
    address private immutable s_kiro;
    address private immutable s_fctController;

    bytes32 public constant OPERATOR_ROLE =
        0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929;

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "not an admin");
        _;
    }

    constructor(
        address kiro,
        address fctController,
        address pairAddress
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);

        s_kiro = kiro;
        s_fctController = fctController;

        IUniswapV2Pair _pair = IUniswapV2Pair(pairAddress);
        pair = _pair;
        token0 = _pair.token0();
        token1 = _pair.token1();
        price0CumulativeLast = _pair.price0CumulativeLast(); // fetch the current accumulated price value (1 / 0)
        price1CumulativeLast = _pair.price1CumulativeLast(); // fetch the current accumulated price value (0 / 1)
        uint112 reserve0;
        uint112 reserve1;
        (reserve0, reserve1, blockTimestampLast) = _pair.getReserves();
        updateKiroPrice();
        s_lastUpdateDateOfPrice = block.timestamp;
        require(reserve0 != 0 && reserve1 != 0, "NO_RESERVES"); // ensure that there's liquidity in the pair
        s_baseBPS = 1000;
        s_bonusBPS = 5000;
        s_activatorShare = 6000;
        s_builderShare = 2000;
        s_minActivatorStake = 100000;
    }

    function activate(bytes calldata data) external {
        uint256 gasStart = gasleft(); // + (data.length == 0 ? 22910 : data.length*12 + (((data.length-1)/32)*128) + 23325);
        console.log("---------------------> activating ", data.length);
        {
            bytes32 id = abi.decode(data, (bytes32));
            // console.logBytes32(id);
            // console.log('value', uint256(id & NONCE_MASK));
            uint256 nextNonce = s_nonces[id & NONCE_ID_MASK] + 1;
            require(nextNonce == uint256(id & NONCE_MASK), "FCT: wrong nonce");
            s_nonces[id & NONCE_ID_MASK] = nextNonce;
            require(s_staked[msg.sender].balance >= s_minActivatorStake, "FCT: not enough staked");
        }

        (bool success_, bytes memory data_) = s_fctController.call(data);
        console.log('------------------------- activate gas --------------------------', gasStart - gasleft());
        console.log('success', success_);
        if (!success_) {
            revert(_getRevertMsg(data_));
        }
        (bytes32[] memory names, address[] memory builders, uint256[] memory maxGasPrices, MReturn[][] memory rts) = abi.decode(data_, (bytes32[], address[], uint256[], MReturn[][]));
        if (
            block.number >
            s_lastUpdateDateOfPrice + s_timeBetweenKiroPriceUpdate
        ) {
            updateKiroPrice();
            s_lastUpdateDateOfPrice = block.number;
        }

        uint256 constGas;
        {
          uint256 sumOfGas;
          uint256 totalCalls;
          uint256 totalCallsGas;
          for (uint256 i = 0; i < rts.length; i++) {
              MReturn[] memory rt = rts[i];
              totalCalls = totalCalls + rts[i].length;
              for (uint256 j = 0; j < rts[i].length; j++) {
                  if (rt[j].vault != address(0)) {
                      sumOfGas += rt[j].gas;
                  }
              }
          }
          uint256 totalGas = gasStart - gasleft();
          constGas = ((totalGas - sumOfGas) / totalCalls) + 1;
          console.log('------------------------- total calls --------------------------', totalCalls);
          console.log('------------------------- total calls gas --------------------------', totalCallsGas);
          console.log('------------------------- fcts  gas --------------------------', sumOfGas);
          console.log('------------------------- const  gas --------------------------', constGas);
        }


        console.log('------------------------- data length --------------------------', data.length);
        console.log('------------------------- res length --------------------------', data_.length);
        uint256 activatorPayment;
        uint256 kiroboPayment;
        Activator storage staked = s_staked[msg.sender];
        for (uint256 i = 0; i < rts.length; i++) {
            uint256 builderPayment;
            MReturn[] memory rt = rts[i];
            uint256 maxGasPrice = maxGasPrices[i];
            address builder = s_builders[names[i]];
            for (uint256 j = 0; j < rt.length; j++) {
                address user = rt[j].vault;
                if (user != address(0)) {
                    uint256 refund = getAmountOfKiroForGivenEth(rt[j].gas + constGas);
                    uint256 fees = getAmountOfKiroForGivenEth(_calcFee(staked, maxGasPrice));
                    s_balances[user] -= (refund + fees);
                    if (builder != address(0)) {
                        uint256 builderFees = fees * s_builderShare / 10000;
                        if (builderFees > 0) {
                            builderPayment += builderFees;
                        }
                        uint256 activatorFees = fees * s_activatorShare / 10000;
                        if (activatorFees > 0) {
                            activatorPayment += (refund + activatorFees);
                        }
                        kiroboPayment += (fees - activatorFees - builderFees);
                    } else {
                        uint256 activatorFees = fees * s_activatorShare / 10000;
                        if (activatorFees > 0) {
                            activatorPayment += (refund + activatorFees);
                        }
                        kiroboPayment += (fees - activatorFees);
                    }
                }
            }
            if (builder != address(0) && builderPayment > 0) {
                s_balances[builder] += builderPayment;
            }
            console.log('------------------------- builderPayment --------------------------', builderPayment);
            console.log('------------------------- activatorPayment --------------------------', activatorPayment);
            console.log('------------------------- kiroboPayment --------------------------', kiroboPayment);
            if (activatorPayment > 0) {
                // Activator storage staked = s_staked[msg.sender];
                s_staked[msg.sender] = Activator(uint160(s_staked[msg.sender].balance + activatorPayment), uint40(block.number));
                //staked.balance += uint160(activatorPayment);
                // staked.timestamp = uint40(block.timestamp);
                s_total_staked += activatorPayment;
            }
            if (kiroboPayment > 0) {
              s_balances[s_kirobo] += kiroboPayment;
            }
        }
        console.log('------------------------- full total gas --------------------------', gasStart - gasleft());
    }

    function _calcFee(Activator storage staked, uint256 maxGasPrice) private returns (uint256) {
      if (s_total_staked == 0) {
        return 0;
      }
      return (Math.min(10000, 10000 * (block.number - staked.blockNumber) * staked.balance / s_total_staked) * 
              (tx.gasprice * s_baseBPS + (maxGasPrice - tx.gasprice) * s_bonusBPS) / 10000 / 10000
      );
    }

    function addFunds(uint256 amount) external {
        IERC20(s_kiro).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );
        s_balances[msg.sender] += amount;
    }

    function addFundsTo(address to, uint256 amount) external {
        IERC20(s_kiro).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );
        s_balances[to] += amount;
    }

    function removeFunds(uint256 amount) external {
        s_balances[msg.sender] -= amount;
        IERC20(s_kiro).safeTransfer(msg.sender, amount);
    }

    function deposit(uint160 amount) external {
        IERC20(s_kiro).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );
        Activator storage staked = s_staked[msg.sender];
        staked.balance += amount;
        s_total_staked += amount;
        staked.blockNumber = uint40(block.number);
    }

    function widthdraw(uint160 amount) external {
        Activator storage staked = s_staked[msg.sender];
        s_total_staked -= amount;
        staked.balance -= amount;
        staked.blockNumber = uint40(block.number);
        IERC20(s_kiro).safeTransfer(
            msg.sender,
            amount
        );
    }

    /**@notice this function checks if the time since the last update is bigger then the desired time set
              if so, the function updates the price */
    function updateKiroPrice() internal {
        (
            uint256 price0Cumulative,
            uint256 price1Cumulative,
            uint32 blockTimestamp
        ) = UniswapV2OracleLibrary.currentCumulativePrices(address(pair));
        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired
        // ensure that at least one full period has passed since the last update
        require(
            timeElapsed >= s_timeBetweenKiroPriceUpdate,
            "PERIOD_NOT_ELAPSED"
        );

        // overflow is desired, casting never truncates
        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        price0Average = FixedPoint.uq112x112(
            uint224((price0Cumulative - price0CumulativeLast) / timeElapsed)
        );
        price1Average = FixedPoint.uq112x112(
            uint224((price1Cumulative - price1CumulativeLast) / timeElapsed)
        );

        price0CumulativeLast = price0Cumulative;
        price1CumulativeLast = price1Cumulative;
        blockTimestampLast = blockTimestamp;
    }

    /**@notice this function returns the amount of kiro that is equal to the input of weth in wei
  @param amountIn the input amount in weth in wei
  this will always return 0 before update has been called successfully for the first time.*/
    function getAmountOfKiroForGivenEth(uint256 amountIn)
        public
        view
        returns (uint256 amountOut)
    {
        if (amountIn == 0) {
          amountOut = 0;
        } else {
          amountOut = price1Average.mul(amountIn).decode144();
        }
    }

        /**@dev updates the time required between kiro price update 
        @param time in seconds 
    */
    function updateTimeBetweenKiroPriceUpdate(uint256 time) external onlyAdmin {
        s_timeBetweenKiroPriceUpdate = time;
    }

    function _getRevertMsg(bytes memory returnData)
        internal
        pure
        returns (string memory)
    {
        if (returnData.length < 68)
            return "Wallet: Transaction reverted silently";

        assembly {
            returnData := add(returnData, 0x04)
        }
        return abi.decode(returnData, (string));
    }

}
