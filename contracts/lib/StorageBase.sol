// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v1;

import "../interfaces/IWallet.sol";
import "../interfaces/ICreator.sol";

interface IProxy {
    function init(address newOwner, address newTarget) external;

    function owner() external view returns (address);

    function target() external view returns (address);
}

interface IVersion {
    function version() external pure returns (bytes8);
}
interface IMigrate is IVersion {
    function migrate(bytes8 fromVersion) external;
}

interface IStorageBase {
    function owner() external view returns (address);
}

contract StorageBase is IProxy {
    address internal s_owner;
    address internal s_target;
    mapping(bytes32 => uint256) internal s_blocked;

    modifier onlyCreator() {
        require(msg.sender == this.creator(), "not creator");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == s_owner, "not owner");
        _;
    }

    constructor() {
        s_owner = msg.sender;
    }

    function init(address newOwner, address newTarget)
        external
        override
        onlyCreator
    {
        if (newOwner != s_owner && newOwner != address(0)) s_owner = newOwner;
        if (newTarget != s_target && newTarget != address(0))
            s_target = newTarget;
        // s_debt = 1; //TODO: remove for production
    }

    function owner() external view override returns (address) {
        return s_owner;
    }

    function target() external view override returns (address) {
        return s_target;
    }

    // needed to pass compilation
    function creator() external pure returns (address) {
        return address(0);
    }
}
