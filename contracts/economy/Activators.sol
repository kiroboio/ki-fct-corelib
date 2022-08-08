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
import "../uniswap-oracle/UniswapV2OracleLibrary.sol";
import "../uniswap-oracle/IUniswapV2Factory.sol";
import "../interfaces/IFactory.sol";
import "../interfaces/IFCT_Controller.sol";
import "../interfaces/IWallet.sol";

import "hardhat/console.sol";

contract Activators is AccessControl {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using FixedPoint for *;

    mapping(address => uint256) public s_activatorBalance;
    mapping(address => uint256) public s_vaultBalance;
    mapping(address => uint256) private s_activators;

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
    address private immutable s_factory;
    address private immutable s_fctController;
    address public immutable KIRO_ADDRESS;

    bytes32 public constant OPERATOR_ROLE =
        0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929;

    uint8 private constant BACKUP_STATE_ACTIVATED = 3;

    modifier onlyActivator() {
        require(s_activators[msg.sender] == 1, "not an activator");
        _;
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "not an admin");
        _;
    }

    constructor(
        address factory,
        address fctController,
        address kiroAddress,
        address pairAddress
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);

        s_factory = factory;
        s_fctController = fctController;
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
        updateKiroPrice();
        s_lastUpdateDateOfPrice = block.timestamp;
        require(reserve0 != 0 && reserve1 != 0, "NO_RESERVES"); // ensure that there's liquidity in the pair
    }

    /**@dev updates the time required between kiro price update 
  @param time in seconds */
    function updateTimeBetweenKiroPriceUpdate(uint256 time) external onlyAdmin {
        s_timeBetweenKiroPriceUpdate = time;
    }

    function addActivator(address activator) external onlyAdmin {
        //require()
        s_activators[activator] = 1;
    }

    function removeActivator(address activator) external onlyAdmin {
        s_activators[activator] = 0;
    }

    // function activateBatchMultiCall(MCalls[] calldata tr, uint256 nonceGroup)
    //     external
    //     onlyActivator
    // {
    //     // uint256 gasStart = gasleft(); // + (data.length == 0 ? 22910 : data.length*12 + (((data.length-1)/32)*128) + 23325);
    //     MReturn[] memory rt = IFCT_BatchMultiSig(s_factory).batchMultiCall_(
    //         tr,
    //         nonceGroup
    //     );

    //     //uint256 totalGas = (gasStart - gasleft());

    //     if (
    //         block.timestamp >
    //         s_lastUpdateDateOfPrice + s_timeBetweenKiroPriceUpdate
    //     ) {
    //         updateKiroPrice();
    //         s_lastUpdateDateOfPrice = block.timestamp;
    //     }

    //     uint256 toPayInKiro;
    //     for (uint256 i = 0; i < rt.length; i++) {
    //         toPayInKiro = getAmountOfKiroForGivenEth(rt[i].gas);
    //         s_vaultBalance[rt[i].vault] -= toPayInKiro;
    //         s_activatorBalance[msg.sender] += toPayInKiro;
    //     }
    // }

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

    function activate(bytes calldata data) external onlyActivator {
        // console.log("---------------------> activating ", data.length);
        uint256 gasStart = gasleft(); // + (data.length == 0 ? 22910 : data.length*12 + (((data.length-1)/32)*128) + 23325);
        (bool success_, bytes memory data_) = s_fctController.call(data);
        console.log('success', success_);
        if (!success_) {
            revert(_getRevertMsg(data_));
        }
        MReturn[][] memory rt = abi.decode(data_, (MReturn[][]));
        uint256 totalGas = (gasStart - gasleft()); // * tx.gasprice;
        // console.log("total gas:", totalGas);
        if (
            block.timestamp >
            s_lastUpdateDateOfPrice + s_timeBetweenKiroPriceUpdate
        ) {
            updateKiroPrice();
            s_lastUpdateDateOfPrice = block.timestamp;
        }

        uint256 sumOfGas;
        uint256 toPayInKiro;
        for (uint256 i = 0; i < rt.length; i++) {
            for (uint256 j = 0; j < rt[i].length; j++) {
                if (rt[i][j].vault != address(0)) {
                    toPayInKiro = getAmountOfKiroForGivenEth(rt[i][j].gas);
                    //console.log("Activators: i", i, "j", j);
                    //console.log("gas:", rt[i][j].gas);
                    //console.log("toPayInKiro", toPayInKiro, "rt[i][j].vault", rt[i][j].vault);
                    sumOfGas += rt[i][j].gas;
                    s_vaultBalance[rt[i][j].vault] -= toPayInKiro;
                    s_activatorBalance[msg.sender] += toPayInKiro;
                }
            }
        }
        // console.log("sumOfGas", sumOfGas);
        // console.log("gas diff", totalGas-sumOfGas);
    }

    // function activateBatchMultiSigCall(
    //     MSCalls[] calldata tr,
    //     bytes32[][] calldata variables
    // ) external onlyActivator {
    //     uint256 gasStart = gasleft(); // + (data.length == 0 ? 22910 : data.length*12 + (((data.length-1)/32)*128) + 23325);
    //     MReturn[][] memory rt = IFCT_BatchMultiSig(s_factory)
    //         .batchMultiSigCall_(tr, variables);

    //     uint256 totalGas = (gasStart - gasleft()); // * tx.gasprice;
    //     console.log("total gas:", totalGas);
    //     if (
    //         block.timestamp >
    //         s_lastUpdateDateOfPrice + s_timeBetweenKiroPriceUpdate
    //     ) {
    //         updateKiroPrice();
    //         s_lastUpdateDateOfPrice = block.timestamp;
    //     }

    //     uint256 sumOfGas;
    //     uint256 toPayInKiro;
    //     for (uint256 i = 0; i < rt.length; i++) {
    //         for (uint256 j = 0; j < rt[i].length; j++) {
    //             if (rt[i][j].vault != address(0)) {
    //                 toPayInKiro = getAmountOfKiroForGivenEth(rt[i][j].gas);
    //                 //console.log("Activators: i", i, "j", j);
    //                 //console.log("gas:", rt[i][j].gas);
    //                 //console.log("toPayInKiro", toPayInKiro, "rt[i][j].vault", rt[i][j].vault);
    //                 sumOfGas += rt[i][j].gas;
    //                 s_vaultBalance[rt[i][j].vault] -= toPayInKiro;
    //                 s_activatorBalance[msg.sender] += toPayInKiro;
    //             }
    //         }
    //     }

    //     console.log("sumOfGas", sumOfGas);
    //     //console.log("gas diff", totalGas-sumOfGas);
    // }

    function activatorWithdraw() external onlyActivator {
        address owner = IWallet(msg.sender).owner();
        address wallet = IFactory(s_factory).getWalletOfOwner(owner);
        require(wallet == msg.sender, "not vault owner");
        require(
            IWallet(wallet).getBackupState() != BACKUP_STATE_ACTIVATED,
            "vault owner is not in active state"
        );
        IERC20(KIRO_ADDRESS).safeTransfer(
            wallet,
            s_activatorBalance[msg.sender]
        );
    }

    function vaultWithdraw() external {
        address owner = IWallet(msg.sender).owner();
        address wallet = IFactory(s_factory).getWalletOfOwner(owner);
        require(wallet == msg.sender, "not vault owner");
        require(
            IWallet(wallet).getBackupState() != BACKUP_STATE_ACTIVATED,
            "vault owner is not in active state"
        );
        IERC20(KIRO_ADDRESS).safeTransfer(wallet, s_vaultBalance[wallet]);
    }

    function addVaultAllowance(address vault, uint256 amount) external {
        IERC20(KIRO_ADDRESS).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );
        s_vaultBalance[vault] += amount;
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
        amountOut = price1Average.mul(amountIn).decode144();
    }
}
