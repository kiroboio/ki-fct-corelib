// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

    struct BuilderPayment {
      address builder;
      uint256 amount;
    }

    struct UserPayment {
      address user;
      uint256 amount;
    }

    struct PaymentIn {
      uint256 balance;
      uint64 blockNumber;
      uint256 totalStaked;
      uint256 gasStart;
    }

    struct PaymentOut {
        uint256 activatorPayment;
        uint256 kiroboPayment;
        // uint256 refund;
        // uint256 fees;
        uint256 totalCalls;
        BuilderPayment[] builderPayments;
        UserPayment[][] userPayments;
    }


interface IFCT_Tokenomics {
    function calcPayments(PaymentIn memory paymentIn, bytes32 id, bytes memory data) external view returns (PaymentOut memory paymentOut);
}
