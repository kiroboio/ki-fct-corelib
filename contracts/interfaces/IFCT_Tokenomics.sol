// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

    struct Payment {
        address payer;
        uint256 gas;
        uint256 effectiveGasPrice;
        uint256 builderShare;
        uint256 activatorShare;
        address builder;
    }

    struct PaymentIn {
      uint256 balance;
      uint64 blockNumber;
      uint256 totalStaked;
      uint256 gasStart;
    }

    // struct PaymentOut {
    //     uint256 totalCalls;
    //     Payment[][] payments;
    //     // address[] builders;
    // }


interface IFCT_Tokenomics {
    function calcPayments(PaymentIn memory paymentIn, bytes32 id, bytes memory data) external view returns (Payment[][] memory paymentOut, address[] memory builders);
}
