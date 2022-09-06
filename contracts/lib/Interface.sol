// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v1;

import "openzeppelin-solidity/contracts/utils/introspection/IERC165.sol";
import "openzeppelin-solidity/contracts/interfaces/IERC1271.sol";

abstract contract Interface is IERC165, IERC1271 {
    bytes4 internal constant SELECTOR_IS_VALID_SIGNATURE =
        bytes4(keccak256("isValidSignature(bytes32,bytes)")); // ERC1271
    bytes4 internal constant SELECTOR_IS_VALID_SIGNATURE2 =
        bytes4(keccak256("isValidSignature(bytes,bytes)")); // non standard ERC1271
    bytes4 internal constant SELECTOR_SUPPORTS_INTERFACE =
        bytes4(keccak256("supportsInterface(bytes4)")); // ERC165
    bytes4 internal constant SELECTOR_ON_ERC721_RECEIVED =
        bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    bytes4 internal constant SELECTOR_ON_ERC1155_RECEIVED =
        bytes4(
            keccak256(
                "onERC1155Received(address,address,uint256,uint256,bytes)"
            )
        );
    bytes4 internal constant SELECTOR_ON_ERC1155_BATCH_RECEIVED =
        bytes4(
            keccak256(
                "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"
            )
        );

    function supportsStaticCall(bytes4 selector) external pure returns (bool) {
        return
            selector == SELECTOR_IS_VALID_SIGNATURE ||
            selector == SELECTOR_SUPPORTS_INTERFACE ||
            selector == SELECTOR_ON_ERC721_RECEIVED ||
            selector == SELECTOR_ON_ERC1155_RECEIVED ||
            selector == SELECTOR_ON_ERC1155_BATCH_RECEIVED;
    }

    function supportsInterface(bytes4 selector) external pure override returns (bool) {
        return
            selector == SELECTOR_SUPPORTS_INTERFACE ||
            selector ==
            (SELECTOR_ON_ERC1155_RECEIVED ^ SELECTOR_ON_ERC1155_BATCH_RECEIVED);
    }

    function isValidSignature(bytes32, bytes calldata) virtual view public returns (bytes4);
    function isValidSignature(bytes memory, bytes calldata) virtual view external returns (bytes4);
}
