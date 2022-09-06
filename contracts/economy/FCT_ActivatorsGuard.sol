// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;
/** @notice Activators contract
 */

import "../interfaces/IFactory.sol";
import "../interfaces/IFCT_Controller.sol";
import "../interfaces/IFCT_Activators.sol";
import "../interfaces/IFCT_ActivatorsGuard.sol";

import "hardhat/console.sol";

contract FCT_ActivatorsGuard is IFCT_ActivatorsGuard {

    address immutable FCT_Controller;
    address immutable FCT_Activators;

    uint256 s_windowBlocks;

    constructor(address fctController, address fctActivatos) {
        FCT_Controller = fctController;
        FCT_Activators = fctActivatos;
        s_windowBlocks = 8;
    }

    function canActivate(address activator) external view returns (bool) {
        uint256 random = uint256(blockhash(block.number / s_windowBlocks * s_windowBlocks - 1));
        uint256 size = IFCT_Activators(FCT_Activators).totalLocked();
        return (IFCT_Activators(msg.sender).getActivator(random % size) == activator);
    }

}
