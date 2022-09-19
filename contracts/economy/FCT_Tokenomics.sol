// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;
/** @notice Activators contract
 */

import "openzeppelin-solidity/contracts/access/AccessControl.sol";
// import "openzeppelin-solidity/contracts/utils/math/Math.sol";
import "../interfaces/IFCT_Controller.sol";
import "../interfaces/IFCT_Actuator.sol";
import "../interfaces/IFCT_Runner.sol";
import "../interfaces/IFCT_Tokenomics.sol";

import "hardhat/console.sol";

bytes32 constant NONCE_ID_MASK = 0xffffffffff0000ffffffffffff00000000000000000000000000000000000000;
bytes32 constant NONCE_MASK = 0x000000000000000000000000000000000000000000000000ffffffffffffffff;

contract FCT_Tokenomics is IFCT_Tokenomics, AccessControl {
    struct Activator {
      uint256 balance;
      uint64 blockNumber;
    }

    struct LocalVars {
        bytes32 funcId;
        bool officialBuilder;
        uint256 builderPayment;
        uint256 maxGasPrice;
        MReturn[] rt;
        address payer;
    }

    // controlled by the dao  TODO: move to Guard
    uint256 s_activatorShare;
    uint256 s_builderShare;
    uint256 s_officialBuilderShare;
    uint256 s_baseBPS;
    uint256 s_bonusBPS;
    address s_kirobo;
        
    address private immutable s_fctActivators;

    bytes32 public constant OPERATOR_ROLE =
        0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929;

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "FCT:T not an admin");
        _;
    }

    constructor(address fctActivators
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);

        s_fctActivators = fctActivators;

        s_baseBPS = 1000;
        s_bonusBPS = 5000;
        s_activatorShare = 6000;
        s_builderShare = 3000;
        }

    function calcPayments(PaymentIn memory paymentIn, bytes32 id, bytes memory data) external view returns (Payment[][] memory paymentOut, address[] memory buildersOut) {
        (bytes32[] memory names, address[] memory builders, uint256[] memory maxGasPrices, MReturn[][] memory rts) = 
            abi.decode(data, (bytes32[], address[], uint256[], MReturn[][]));
    
        // console.log('------------------------- data length --------------------------', data.length);
       
        paymentOut = new Payment[][](rts.length);
        buildersOut = builders;
        for (uint256 i = 0; i < rts.length; i++) {
            LocalVars memory lv = LocalVars({ payer: address(0), rt: rts[i], funcId: id, builderPayment: 0, officialBuilder: false, maxGasPrice: maxGasPrices[i]});
                        
            address builder = IFCT_Activators(s_fctActivators).getBuilder(names[i]);
            if (builder != address(0)) {
                buildersOut[i] = builder;
                lv.officialBuilder = true;
            }
        
            Payment[] memory payments = new Payment[](lv.rt.length);
            paymentOut[i] = payments;
            for (uint256 j = 0; j < lv.rt.length; j++) {
                lv.payer = lv.rt[j].payer;
                if (lv.payer != address(0)) {
                    // console.log('real gas price', tx.gasprice);
                    // console.log('max gas price', lv.maxGasPrice);
                    Payment memory payment = payments[j];
                    payment.payer = lv.payer;
                    payment.gas = lv.rt[j].gas;
                    payment.effectiveGasPrice = _calcEffectiveGasPrice(paymentIn, lv.maxGasPrice);
                    payment.builderShare = lv.officialBuilder ? s_officialBuilderShare: s_builderShare;
                    payment.activatorShare = s_activatorShare;
                    // console.log('effective price', payment.effectiveGasPrice);
                }
            }
        }
    }

    function _calcEffectiveGasPrice(PaymentIn memory paymentIn, uint256 maxGasPrice) private view returns (uint256) {
      if (paymentIn.totalStaked == 0) {
        return 0;
      }
      // console.log('block diff', block.number - paymentIn.blockNumber);
      // console.log('tx.gasprice', tx.gasprice);
      // console.log('price diff', maxGasPrice - tx.gasprice);
      return (Math.min(10000, 10000 * (block.number - paymentIn.blockNumber) * paymentIn.balance / paymentIn.totalStaked) * 
              (tx.gasprice * (10000 + s_baseBPS) + (maxGasPrice - tx.gasprice) * s_bonusBPS) / 10000 / 10000
      );
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
