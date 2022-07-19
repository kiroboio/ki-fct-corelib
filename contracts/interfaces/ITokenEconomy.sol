// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

interface IActivator {
    struct Fees {
        uint256 fee;
        address kiro;
    }

    struct ActivatorRequirements {
        bool hasVault;
        uint256 kiroAmount;
        uint256 whitelistedKiroAmount;
        uint256 discountedBPS;
        address discountNFT;
    }

    event AddedToWhitelist(address account);

    event RemovedFromWhitelist(address account);

    event TimeoutChanged(uint256 timeout);

    event RequireFundsChanged(bool requireFunds);

    event BackupFees(uint256 minFees);

    event InheritanceFees(uint256 minFees);

    event TokenInheritanceFees(uint256 minFees);

    event BackupRequirements(
        bool hasVault,
        uint256 kiroAmount,
        uint256 discountedBPS,
        address indexed discountNFT
    );

    event InheritanceRequirements(
        bool hasVault,
        uint256 kiroAmount,
        uint256 discountedBPS,
        address indexed discountNFT
    );

    event TokenInheritanceRequirements(
        bool hasVault,
        uint256 kiroAmount,
        uint256 discountedBPS,
        address indexed discountNFT
    );

    function setTimeout(uint256 timeout) external;

    function getTimeout() external view returns (uint256);

    function setRequireFunds(bool requireFunds) external;

    function getRequireFunds() external view returns (bool);

    function addToWhitelist(address account) external;

    function removeFromWhitelist(address account) external;

    function setBackupFees(uint256 createFee) external;

    function setBackupRequirements(
        bool hasVault,
        uint256 kiroAmount,
        uint256 whitelistedKiroAmount,
        uint256 discountedBPS,
        address discountNFT
    ) external;

    function setInheritanceFees(uint256 createFee) external;

    function setTokenInheritanceFees(uint256 createFee) external;

    function setInheritanceRequirements(
        bool hasVault,
        uint256 kiroAmount,
        uint256 whitelistedKiroAmount,
        uint256 discountedBPS,
        address discountNFT
    ) external;

    function setTokenInheritanceRequirements(
        bool hasVault,
        uint256 kiroAmount,
        uint256 whitelistedKiroAmount,
        uint256 discountedBPS,
        address discountNFT
    ) external;

    function getBackupRequirements()
        external
        view
        returns (ActivatorRequirements memory);

    function getBackupFees() external view returns (Fees memory);

    function getInheritanceRequirements()
        external
        view
        returns (ActivatorRequirements memory);

    function getTokenInheritanceRequirements()
        external
        view
        returns (ActivatorRequirements memory);

    function getInheritanceFees() external view returns (Fees memory);

    function getTokenInheritanceFees() external view returns (Fees memory);
}

interface IBackupPayment {
    function migrateBackup(address vaultOwner, address from) external;

    function updateBackupFunds(address vaultOwner, uint256 funds) external;

    function activateBackup(address vault) external;
}

interface IInheritancePayment {
    function migrateInheritance(address vaultOwner, address from) external;

    function updateInheritanceFunds(address vaultOwner, uint256 funds) external;

    function activateInheritance(address vault) external;

    function migrateTokenInheritance(
        address vaultOwner,
        address from,
        address[] calldata tokens
    ) external;

    function updateTokenInheritanceFunds(
        address vaultOwner,
        address[] calldata tokensToAdd,
        address[] calldata tokensToRemove,
        uint256 fundsPerToken
    ) external;

    function activateTokenInheritance(address vault, address token) external;

    function updateAllInheritanceFunds(
        address vaultOwner,
        uint256 funds,
        address[] calldata tokensToAdd,
        address[] calldata tokensToRemove,
        uint256 fundsPerToken
    ) external;

    function updateAllFunds(
        address vaultOwner,
        uint256 backupFunds,
        uint256 inheritanceFunds,
        address[] calldata tokensToAdd,
        address[] calldata tokensToRemove,
        uint256 fundsPerToken
    ) external;
}
