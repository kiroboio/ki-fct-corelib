// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v1;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../contracts/lib/Interface.sol";
import "../../contracts/lib/Storage.sol";
import "../../contracts/interfaces/IOracle.sol";

contract RecoveryWallet2 is IMigrate, StorageBase, Storage, ReentrancyGuard, Interface {
  using SignatureChecker for address;
  using SafeERC20 for IERC20;
  using ECDSA for bytes32;

  uint8 public constant VERSION_NUMBER = 128;
  string public constant NAME = "Kirobo OCW";
  string public constant VERSION = "RC07-2.1";
  address public immutable GAS_RETURN_CONTRACT;
  address public immutable RECOVERY_WALLET_CORE_CONTRACT;

  event SentEther(
    address indexed creator,
    address indexed owner,
    address indexed to,
    uint256 value
  );
  event Transfer20(
    address indexed creator,
    address indexed token,
    address from,
    address indexed to,
    uint256 value
  );
  event Transfer721(
    address indexed creator,
    address indexed token,
    address from,
    address indexed to,
    uint256 id,
    bytes data
  );

  event Transfer1155(
    address indexed creator,
    address indexed token,
    address from,
    address indexed to,
    uint256 id,
    uint256 amount,
    bytes data
  );

  event TransferBatch1155(
    address indexed creator,
    address indexed token,
    address from,
    address indexed to,
    uint256[] ids,
    uint256[] amounts,
    bytes data
  );

  modifier onlyActiveOwner() {
      require(
        msg.sender == s_owner && s_backup.state != BACKUP_STATE_ACTIVATED,
        "not active owner"
      );
      _;
    }

  modifier onlyGasReturnContract(address _account) {
    require(GAS_RETURN_CONTRACT == _account, "sender not authorised");
    _;
  }

  constructor(address core, address gasReturn) {
    GAS_RETURN_CONTRACT = gasReturn;
    RECOVERY_WALLET_CORE_CONTRACT = core;
    require(IVersion(core).version() == bytes8(bytes(VERSION)), "Wrong Version");
  }

  function onERC721Received(
    address,
    address,
    uint256,
    bytes calldata
  ) external pure returns (bytes4) {
    return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
  }

  function sendEther(address payable to, uint256 value)
    external
    onlyActiveOwner
    nonReentrant
    returns (bytes memory)
  {
    require(value > 0, "value == 0");
    require(value <= address(this).balance, "value > balance");
    emit SentEther(this.creator(), address(this), to, value);
    (bool sent, bytes memory data) = to.call{ value: value }("");
    require(sent, "Failed to send Ether");
    return data;
  }

  function transfer20(
    address token,
    address to,
    uint256 value
  ) external onlyActiveOwner {
    require(token != address(0), "token is 0x0");
    emit Transfer20(this.creator(), token, address(this), to, value);
    IERC20(token).safeTransfer(to, value);
  }

  function transferFrom20(
    address token,
    address from,
    address to,
    uint256 value
  ) external onlyActiveOwner {
    require(token != address(0), "token is 0x0");
    address sender = from == address(0) ? address(this) : from;
    emit Transfer20(this.creator(), token, sender, to, value);
    IERC20(token).safeTransferFrom(sender, to, value);
  }

  function transfer721(
    address token,
    address to,
    uint256 value
  ) external onlyActiveOwner {
    safeTransferFrom721(token, address(0), to, value);
  }

  function safeTransferFrom721(
    address token,
    address from,
    address to,
    uint256 id
  ) public onlyActiveOwner {
    require(token != address(0), "token is 0x0");
    address sender = from == address(0) ? address(this) : from;
    emit Transfer721(this.creator(), token, sender, to, id, "");
    IERC721(token).safeTransferFrom(sender, to, id);
  }

  function safeTransferFrom721wData(
    address token,
    address from,
    address to,
    uint256 id,
    bytes memory data
  ) external onlyActiveOwner {
    require(token != address(0), "token is 0x0");
    address sender = from == address(0) ? address(this) : from;
    emit Transfer721(this.creator(), token, sender, to, id, data);
    IERC721(token).safeTransferFrom(sender, to, id, data);
  }
  
  function safeTransferFromERC1155(
    address token,
    address from,
    address to,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) external onlyActiveOwner {
    require(token != address(0), "token is 0x0");
    address sender = from == address(0) ? address(this) : from;
    emit Transfer1155(this.creator(), token, sender, to, id, amount, data);
    IERC1155(token).safeTransferFrom(from, to, id, amount, data);
  }

  function safeBatchTransferFromERC1155(
    address token,
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) external onlyActiveOwner {
    require(token != address(0), "token is 0x0");
    address sender = from == address(0) ? address(this) : from;
    emit TransferBatch1155(
      this.creator(),
      token,
      sender,
      to,
      ids,
      amounts,
      data
    );
    IERC1155(token).safeBatchTransferFrom(from, to, ids, amounts, data);
  }

  function getBalance() external view returns (uint256) {
    return address(this).balance;
  }

  function balanceOf20(address token) external view returns (uint256) {
    return IERC20(token).balanceOf(address(this));
  }

  function balanceOf721(address token) external view returns (uint256) {
    return IERC721(token).balanceOf(address(this));
  }

  function balanceOf1155(address token, uint256 id)
    external
    view
    returns (uint256)
  {
    return IERC1155(token).balanceOf(address(this), id);
  }

  function is20Safe(address token) external view returns (bool) {
    return IOracle(ICreator(this.creator()).oracle()).is20Safe(token);
  }

  function is721Safe(address token) external view returns (bool) {
    return IOracle(ICreator(this.creator()).oracle()).is721Safe(token);
  }

  function approveERC20(
    address token,
    address spender,
    uint256 amount
  ) external onlyActiveOwner returns(bool){
    return IERC20(token).approve(spender, amount);
  }

  function approveERC721(
    address token,
    address to,
    uint256 tokenId
  ) external onlyActiveOwner{
    IERC721(token).approve(to, tokenId);
  }

  function approveERC1155(address token, address to) external onlyActiveOwner{
    IERC1155(token).setApprovalForAll(to, true);
  }

  function oracle() external view returns (address) {
    return ICreator(this.creator()).oracle();
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
        keccak256(bytes(string(abi.encodePacked(VERSION)))),
        chainId,
        address(this),
        s_uid
      )
    );
  }

  function version() external pure override returns (bytes8) {
    return bytes8(bytes(VERSION));
  }

  fallback() external {
       if (
            msg.sig == SELECTOR_ON_ERC721_RECEIVED ||
            msg.sig == SELECTOR_ON_ERC1155_RECEIVED ||
            msg.sig == SELECTOR_ON_ERC1155_BATCH_RECEIVED
    ) {
            assembly {
                calldatacopy(0, 0, 0x04)
                return(0, 0x20)
            }
    }
        address core = RECOVERY_WALLET_CORE_CONTRACT; 
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

  function execute(
    address to,
    uint256 value,
    bytes calldata data
  ) external onlyActiveOwner returns (bytes memory) {
    (bool success, bytes memory res) = to.call{ value: value }(data);
    if (!success) {
      revert(_getRevertMsg(res));
    }
    return res;
  }

  function execute2(address payable to, uint256 value, bytes calldata data) external onlyGasReturnContract(msg.sender) returns (bytes memory){
    (bool success, bytes memory res) = to.call{value: value}(data);
    if(!success){
        revert(_getRevertMsg((res)));
    }
    return res;
  }

  function blockTransaction(bytes32 messageHash) external onlyOwner {
      require(messageHash != bytes32(0), "blocking 0x0 is not allowed");
      s_blocked[messageHash] = 1;
  }

  function unblockTransaction(bytes32 messageHash) external onlyOwner {
      s_blocked[messageHash] = 0;
  }

  function isValidSignature(
    bytes calldata _data,
    bytes calldata _signature
  ) external view override returns (bytes4) {
    if (isValidSignature(keccak256(_data), _signature) == SELECTOR_IS_VALID_SIGNATURE) {
      return SELECTOR_IS_VALID_SIGNATURE2;
    }
    return 0xffffffff;
  }

  function isValidSignature(
    bytes32 _hash,
    bytes calldata _signature
  ) public view override returns (bytes4) {
    address signer = _hash.recover(_signature);
    if (signer == s_owner && s_backup.state != BACKUP_STATE_ACTIVATED) {
      return SELECTOR_IS_VALID_SIGNATURE;
    }
    return 0xffffffff;
  }


  function _getRevertMsg(bytes memory returnData)
    private
    pure
    returns (string memory)
  {
    if (returnData.length < 68) return "Wallet: Transaction reverted silently";

    assembly {
      returnData := add(returnData, 0x04)
    }
    return abi.decode(returnData, (string));
  }
}
