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
import "../interfaces/IFCT_Actuator.sol";
import "../interfaces/IFCT_Tokenomics.sol";
import "../interfaces/IFCT_Runner.sol";
import "../interfaces/IWallet.sol";

import "hardhat/console.sol";

bytes32 constant NONCE_ID_MASK = 0xffffffffff0000ffffffffffff00000000000000000000000000000000000000;
bytes32 constant NONCE_MASK = 0x000000000000000000000000000000000000000000000000ffffffffffffffff;

contract FCT_Actuator is AccessControl {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using FixedPoint for *;

    struct Activator {
      uint256 balance;
      uint64 blockNumber;
    }

    // struct BuilderPayment {
    //   address builder;
    //   uint256 amount;
    // }

    // struct UserPayment {
    //   address user;
    //   uint256 amount;
    // }

    // // struct Payment {
    //     uint256 activator;
    //     uint256 kirobo;
    //     uint256 refund;
    //     uint256 fees;
    //     uint256 totalStaked;
    // }

    // struct PaymentOut {
    //     uint256 activatorPayment;
    //     uint256 kiroboPayment;
    //     uint256 refund;
    //     uint256 fees;
    //     BuilderPayment[] builderPayments;
    //     UserPayment[][] userPayments;
    // }

    // struct PaymentIn {
    //   uint256 balance;
    //   uint64 blockNumber;
    //   uint256 totalStaked;
    //   uint256 gasStart;
    // }

    struct LocalVars {
        bytes32 funcId;
        bool officialBuilder;
        uint256 builderPayment;
        uint256 maxGasPrice;
        uint256 refund;
        MReturn[] rt;
        address user;
    }

    // balances
    uint256 public s_minActivatorStake;
    uint256 public s_total_staked;
    mapping(address => Activator) public s_staked;
    mapping(address => uint256) public s_balances;
    
    mapping(bytes32 => address) public s_builders; // TODO: officialBuilders
    mapping(bytes32 => uint256) public s_nonces;

    // controlled by the dao  TODO: move to Guard
    uint256 s_activatorShare;
    uint256 s_builderShare;
    uint256 s_officialBuilderShare;
    uint256 s_baseBPS;
    uint256 s_bonusBPS;
    address s_kirobo;

    address s_tokenomics;
        
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
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "FCT:A not an admin");
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
        _updateKiroPrice();
        s_lastUpdateDateOfPrice = block.timestamp;
        require(reserve0 != 0 && reserve1 != 0, "FCT:A no reserves"); // ensure that there's liquidity in the pair
        // s_baseBPS = 1000;
        // s_bonusBPS = 5000;
        // s_activatorShare = 6000;
        // s_builderShare = 3000;
        // s_minActivatorStake = 100000;
    }

    function getBuilder(bytes32 nameHash) public view returns (address) {
        return s_builders[nameHash];
    }

    function setTokenomics(address tokenomics) external {
        s_tokenomics = tokenomics;
    }

    function _registerNonce(bytes32 id) private {
        uint256 nextNonce = s_nonces[id & NONCE_ID_MASK] + 1;
        require(nextNonce == uint256(id & NONCE_MASK), "FCT:A wrong nonce");
        s_nonces[id & NONCE_ID_MASK] = nextNonce;
        require(s_staked[msg.sender].balance >= s_minActivatorStake, "FCT:A not enough staked");        
    }

    function activate2(bytes calldata data) external {
        bytes32 id = abi.decode(data, (bytes32));
        _registerNonce(id);
        (bool success_, bytes memory data_) = s_fctController.call(data);
        if (!success_) {
            revert(_getRevertMsg(data_));
        }
    }

    function activate(bytes calldata data) external returns (uint256) {
        uint256 gasStart = gasleft(); // + (data.length == 0 ? 22910 : data.length*12 + (((data.length-1)/32)*128) + 23325);
        // console.log('gas start', gasleft());
        // console.log("---------------------> activating ", data.length);
        bytes32 id = abi.decode(data, (bytes32));
        _registerNonce(id);
        (bool success_, bytes memory data_) = s_fctController.call(data);
        if (!success_) {
            revert(_getRevertMsg(data_));
        }
        if (block.number > s_lastUpdateDateOfPrice + s_timeBetweenKiroPriceUpdate) {
            _updateKiroPrice();
            s_lastUpdateDateOfPrice = block.number;
        }

        Activator storage activator = s_staked[msg.sender];
        (Payment[][] memory paymentOut, address[] memory builders) = 
            IFCT_Tokenomics(s_tokenomics).calcPayments(PaymentIn({ balance: activator.balance, blockNumber: activator.blockNumber, totalStaked: s_total_staked, gasStart: gasStart }), id, data_);

        require(paymentOut.length == builders.length, "FCT:A payment-builder not match");

        uint256 totalUserGas;
        uint256 totalCalls;
    
        for (uint256 i; i<paymentOut.length; i++) {
            Payment[] memory payments = paymentOut[i];
            for (uint256 j; j<payments.length; j++) {
                Payment memory payment = payments[j];
                address payer = payment.payer;
                if (payer != address(0)) {
                    uint256 userGasStart = gasleft();
                    IFCT_Runner(payer).fctIsVersionSupported(id);
                    s_balances[payer] += 1;
                    payment.gas += (userGasStart - gasleft());
                    totalUserGas += payment.gas;
                    ++totalCalls;
                }
            }
        }

        for (uint256 i; i<builders.length; i++) {
            address builder = builders[i];
            if (builder != address(0)) {
                s_balances[builder] += 1;
            }
        }

        uint256 commonGas = (gasStart - gasleft() - totalUserGas + 200*builders.length + 800*totalCalls + 33000 + 14*msg.data.length);
        // console.log("common gas", commonGas);
        // console.log("users gas", totalUserGas);
        uint256 commonGasPerCall =  commonGas / totalCalls + 1;

        uint256 totalActivatorPayment;
        uint256 totalKiroboPayment;        
        uint256 totalFees;
        for (uint256 i; i<paymentOut.length; i++) {
            address builder = builders[i];
            Payment[] memory payments = paymentOut[i];
            uint256 totalBuilderPayment;
            for (uint256 j; j<payments.length; j++) {
                Payment memory payment = payments[j];
                address payer = payment.payer;
                if (payer != address(0)) {
                    // uint256 fee = (payment.gas + commonGasPerCall);
                    // uint256 fee = ((payment.gas + commonGasPerCall) * payment.effectiveGasPrice);
                    uint256 fee = getAmountOfKiroForGivenEth((payment.gas + commonGasPerCall) * payment.effectiveGasPrice);
                    // console.log("fee", fee);
                    uint256 builderPayment = (fee * payment.builderShare / 10000);
                    uint256 activatorPayment = (fee * payment.activatorShare / 10000);
                    s_balances[payer] -= fee;
                    totalFees += fee;
                    totalBuilderPayment += builderPayment;
                    totalActivatorPayment += activatorPayment;
                    totalKiroboPayment += (fee - builderPayment - activatorPayment);
                }
            }
            s_balances[builder] += totalBuilderPayment;
        }

        s_staked[msg.sender] = Activator(s_staked[msg.sender].balance + totalActivatorPayment, uint64(block.number));
        s_total_staked += totalActivatorPayment;
        s_balances[s_kirobo] += totalKiroboPayment;
        console.log("total gas", commonGas + totalUserGas);
        return totalActivatorPayment;
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

    function moveFundsToDeposit(uint256 amount) external {
        s_balances[msg.sender] -= amount;
        Activator storage staked = s_staked[msg.sender];
        staked.balance += amount;
        staked.blockNumber = uint64(block.number);
        s_total_staked += amount;
    }

    function moveFundsFromDeposit(uint256 amount) external {
        s_balances[msg.sender] += amount;
        Activator storage staked = s_staked[msg.sender];
        staked.balance -= amount;
        staked.blockNumber = uint64(block.number);
        s_total_staked -= amount;
    }

    function deposit(uint256 amount) external {
        IERC20(s_kiro).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );
        Activator storage staked = s_staked[msg.sender];
        staked.balance += amount;
        s_total_staked += amount;
        staked.blockNumber = uint64(block.number);
    }

    function widthdraw(uint256 amount) external {
        Activator storage staked = s_staked[msg.sender];
        s_total_staked -= amount;
        staked.balance -= amount;
        staked.blockNumber = uint64(block.number);
        IERC20(s_kiro).safeTransfer(
            msg.sender,
            amount
        );
    }

    /**@notice this function checks if the time since the last update is bigger then the desired time set
              if so, the function updates the price */
    function _updateKiroPrice() private {
        (
            uint256 price0Cumulative,
            uint256 price1Cumulative,
            uint32 blockTimestamp
        ) = UniswapV2OracleLibrary.currentCumulativePrices(address(pair));
        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired
        // ensure that at least one full period has passed since the last update
        require(
            timeElapsed >= s_timeBetweenKiroPriceUpdate,
            "FCT:A period not elapsed"
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
