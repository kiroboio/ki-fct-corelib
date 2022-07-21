// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-solidity/contracts/utils/cryptography/SignatureChecker.sol";
import "./interfaces/IOracle.sol";
import "./lib/Heritable.sol";

contract Wallet is IMigrate, StorageBase, Storage {
    using SignatureChecker for address;

    uint8 public constant VERSION_NUMBER = 0x2;
    string public constant NAME = "Kirobo OCW";
    string public constant VERSION = "2";

    address public immutable WALLET_CORE_CONTRACT;

    event BatchCall(
        address indexed creator,
        address indexed owner,
        address indexed activator,
        uint256 value
    );

    modifier onlyActiveOwner() {
        require(
        msg.sender == s_owner && s_backup.state != BACKUP_STATE_ACTIVATED,
        "not active owner"
        );
        _;
    }

    modifier onlyActiveState() {
        require(s_backup.state != BACKUP_STATE_ACTIVATED, "not active state");
        _;
    }

    constructor(address core) {
        WALLET_CORE_CONTRACT = core;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function balanceOf20(address token) public view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function balanceOf721(address token) public view returns (uint256) {
        return IERC721(token).balanceOf(address(this));
    }

    function migrate(bytes8) external override onlyCreator {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }

        s_uid = bytes32(
            (uint256(VERSION_NUMBER) << 248) |
                ((uint256(blockhash(block.number - 1)) << 192) >> 16) |
                uint256(uint160(address(this)))
        );

        CHAIN_ID = chainId;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)"
                ),
                keccak256(bytes(NAME)),
                keccak256(bytes(VERSION)),
                chainId,
                address(this),
                s_uid
            )
        );
    }

    function version() public pure override returns (bytes8) {
        return bytes8("1.2.1");
    }

    fallback() external {
        address core = WALLET_CORE_CONTRACT; 
        assembly {
            // copy function selector and any arguments
            calldatacopy(0, 0, calldatasize())
             // execute function call using the core
            let result := delegatecall(gas(), core, 0, calldatasize(), 0, 0)
            // get any return value
            returndatacopy(0, 0, returndatasize())
            // return any return value or error back to the caller
            switch result
                case 0 {
                    revert(0, returndatasize())
                }
                default {
                    return(0, returndatasize())
                }
        }
    }

    receive() external payable {
        require(false, "Wallet: not aceepting ether");
    }

    struct MetaData {
        bool simple;
        bool staticcall;
        uint32 gasLimit;
    }

    struct Call {
        uint8 v;
        bytes32 r;
        bytes32 s;
        bytes32 typeHash;
        address to;
        uint256 value;
        MetaData metaData;
        bytes data;
    }

    struct Transfer {
        uint8 v;
        bytes32 r;
        bytes32 s;
        address to;
        uint256 value;
    }

    struct Signature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    struct Send {
        uint8 v;
        bytes32 r;
        bytes32 s;
        address to;
        uint256 value;
        bool eip712;
    }

    struct XCall {
        uint8 v1;
        bytes32 r1;
        bytes32 s1;
        uint8 v2;
        bytes32 r2;
        bytes32 s2;
        bytes32 typeHash;
        address to;
        uint256 value;
        MetaData metaData;
        bytes data;
    }

    function blockTransaction(bytes32 messageHash) external onlyOwner {
        require(messageHash != bytes32(0), "blocking 0x0 is not allowed");
        s_blocked[messageHash] = 1;
    }

    function unblockTransaction(bytes32 messageHash) external onlyOwner {
        s_blocked[messageHash] = 0;
    }

    function _selector(bytes calldata data) private pure returns (bytes4) {
        return
            data[0] |
            (bytes4(data[1]) >> 8) |
            (bytes4(data[2]) >> 16) |
            (bytes4(data[3]) >> 24);
    }

    function erc20BalanceGT(
        address token,
        address account,
        uint256 value
    ) external view {
        require(
            IERC20(token).balanceOf(account) >= value,
            "ERC20Balance: too low"
        );
    }

    function generateMessage(
        Call calldata call,
        address activator,
        uint256 targetNonce
    ) public pure returns (bytes memory) {
        return _generateMessage(call, activator, targetNonce);
    }

    function generateXXMessage(XCall calldata call, uint256 targetNonce)
        public
        pure
        returns (bytes memory)
    {
        return _generateXXMessage(call, targetNonce);
    }

    function _generateMessage(
        Call calldata call,
        address activator,
        uint256 targetNonce
    ) private pure returns (bytes memory) {
        return
            call.metaData.simple
                ? abi.encode(
                    call.typeHash,
                    activator,
                    call.to,
                    call.value,
                    targetNonce,
                    call.metaData.staticcall,
                    call.metaData.gasLimit,
                    keccak256(call.data)
                )
                : abi.encode(
                    call.typeHash,
                    activator,
                    call.to,
                    call.value,
                    targetNonce,
                    call.metaData.staticcall,
                    call.metaData.gasLimit,
                    _selector(call.data),
                    call.data[4:]
                );
    }

    function _generateXXMessage(XCall calldata call, uint256 targetNonce)
        private
        pure
        returns (bytes memory)
    {
        return
            call.metaData.simple
                ? abi.encode(
                    call.typeHash,
                    call.to,
                    call.value,
                    targetNonce,
                    call.metaData.staticcall,
                    call.metaData.gasLimit,
                    keccak256(call.data)
                )
                : abi.encode(
                    call.typeHash,
                    call.to,
                    call.value,
                    targetNonce,
                    call.metaData.staticcall,
                    call.metaData.gasLimit,
                    _selector(call.data),
                    call.data[4:]
                );
    }

    function executeBatchCall(Call[] calldata tr)
        public
        payable
        onlyActiveState
    {
        address creator = this.creator();
        address activator = ICreatorProxy(creator).activator();
        uint32 currentNonce = s_nonce;
        address owner = s_owner;
        require(
            msg.sender == activator || msg.sender == owner,
            "Wallet: sender not allowed"
        );

        for (uint256 i = 0; i < tr.length; i++) {
            Call calldata call = tr[i];
            address to = call.to;
            uint256 gasLimit = call.metaData.gasLimit;
            unchecked {
                address signer = ecrecover(
                    _messageToRecover(
                        keccak256(
                            _generateMessage(call, msg.sender, currentNonce + i)
                        ),
                        call.typeHash != bytes32(0)
                    ),
                    call.v,
                    call.r,
                    call.s
                );
                require(
                    signer != msg.sender,
                    "Wallet: sender cannot be signer"
                );
                require(
                    signer == owner || signer == activator,
                    "Wallet: signer not allowed"
                );
                require(
                    to != msg.sender &&
                        to != signer &&
                        to != address(this) &&
                        to != creator,
                    "Wallet: reentrancy not allowed"
                );
            }
            (bool success, bytes memory res) = call.metaData.staticcall
                ? to.staticcall{gas: gasLimit > 0 ? gasLimit : gasleft()}(
                    call.data
                )
                : to.call{
                    gas: gasLimit > 0 ? gasLimit : gasleft(),
                    value: call.value
                }(call.data);
            if (!success) {
                revert(_getRevertMsg(res));
            }
        }
        unchecked {
            s_nonce = currentNonce + uint32(tr.length);
        }
        emit BatchCall(creator, owner, activator, block.number);
    }

    function executeXXBatchCall(XCall[] calldata tr)
        public
        payable
        onlyActiveState
    {
        address creator = this.creator();
        address activator = ICreatorProxy(creator).activator();
        require(
            msg.sender == s_owner || msg.sender == activator,
            "Wallet: sender is not owner nor activator"
        );

        for (uint256 i = 0; i < tr.length; i++) {
            XCall calldata call = tr[i];

            unchecked {
                address signer1 = ecrecover(
                    _messageToRecover(
                        keccak256(_generateXXMessage(call, s_nonce + i)),
                        call.typeHash != bytes32(0)
                    ),
                    call.v1,
                    call.r1,
                    call.s1
                );
                address signer2 = ecrecover(
                    _messageToRecover(
                        keccak256(_generateXXMessage(call, s_nonce + i)),
                        call.typeHash != bytes32(0)
                    ),
                    call.v2,
                    call.r2,
                    call.s2
                );
                require(signer1 == s_owner, "Wallet: signer1 is not owner");
                require(
                    signer2 == activator,
                    "Wallet: signer2 is not activator"
                );
                require(
                    call.to != signer1 &&
                        call.to != signer2 &&
                        call.to != address(this) &&
                        call.to != creator,
                    "Wallet: reentrancy not allowed"
                );
            }
            (bool success, bytes memory res) = call.metaData.staticcall
                ? call.to.staticcall{
                    gas: call.metaData.gasLimit > 0
                        ? call.metaData.gasLimit
                        : gasleft()
                }(call.data)
                : call.to.call{
                    gas: call.metaData.gasLimit > 0
                        ? call.metaData.gasLimit
                        : gasleft(),
                    value: call.value
                }(call.data);
            if (!success) {
                revert(_getRevertMsg(res));
            }
        }
        s_nonce = s_nonce + uint32(tr.length);
        emit BatchCall(creator, s_owner, activator, block.number);
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

    function cancelCall() public onlyActiveOwner {
        s_nonce = s_nonce + 1;
    }

    function nonce() public view returns (uint32) {
        return s_nonce;
    }
        
    function _messageToRecover(bytes32 hashedUnsignedMessage, bool eip712)
        private
        view
        returns (bytes32)
    {
        if (eip712) {
            return
                keccak256(
                    abi.encodePacked(
                        "\x19\x01",
                        DOMAIN_SEPARATOR,
                        hashedUnsignedMessage
                    )
                );
        }
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    hashedUnsignedMessage
                )
            );
    }
}
