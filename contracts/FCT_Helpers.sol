// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
pragma abicoder v1;

import "openzeppelin-solidity/contracts/utils/cryptography/SignatureChecker.sol";
import "openzeppelin-solidity/contracts/utils/cryptography/ECDSA.sol";


abstract contract FCT_Helpers {
    using SignatureChecker for address;
    using ECDSA for bytes32;

    function _addressFromMessageAndSignature(
        bytes32 messageHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal pure returns (address) {
        if (v != 0) {
            return messageHash.recover(v, r, s);
        }
        return
            messageHash.recover(
                27 + uint8(uint256(s) >> 255),
                r,
                s &
                    0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
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
