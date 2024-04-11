import * as dotenv from "dotenv";
import { existsSync, readFileSync, writeFileSync } from "fs";

import { ethers } from "../src";
import scriptData from "./scriptData";

const ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "by",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "activator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "builder",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "kiroboPayment",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "builderPayment",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "activatorPayment",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "base",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "fees",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "commonGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "userGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "missingKiro",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "availableEth",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct Total",
        name: "total",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "gasPrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_Activated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "activator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        components: [
          {
            internalType: "bool",
            name: "activate",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "activateBatch",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "activateForFree",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "activateForFreeBatch",
            type: "bool",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Approvals",
        name: "approvals",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_ActivationApproval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "by",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "builder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_BuilderUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "builder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "call",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalKiroFees",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "kiroPayed",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ethPayed",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "builderPayment",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "activatorPayment",
        type: "uint256",
      },
    ],
    name: "FCTE_CallPayment",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint32",
            name: "kiroPriceBPS",
            type: "uint32",
          },
          {
            internalType: "bool",
            name: "paused",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "freezed",
            type: "bool",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.EthPenalty",
        name: "ethPenalty",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_EthStatusChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "by",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "activator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "activatorFees",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "calcGas",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "gasPrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_ForFreeActivated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "by",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "feesLimitBPS",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_ForFreeFeesLimitUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "kiro",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "eth",
            type: "uint96",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Balance",
        name: "balance",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "kiro",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "eth",
            type: "uint96",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Balance",
        name: "amounts",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_FundsAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "kiro",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "eth",
            type: "uint96",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Balance",
        name: "staking",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "kiro",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "eth",
            type: "uint96",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Balance",
        name: "balance",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "kiro",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "eth",
            type: "uint96",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Balance",
        name: "amounts",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_FundsMovedFromDeposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "kiro",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "eth",
            type: "uint96",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Balance",
        name: "balance",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "kiro",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "eth",
            type: "uint96",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Balance",
        name: "staking",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "kiro",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "eth",
            type: "uint96",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Balance",
        name: "amounts",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_FundsMovedToDeposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "kiro",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "eth",
            type: "uint96",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Balance",
        name: "balance",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "kiro",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "eth",
            type: "uint96",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Balance",
        name: "amounts",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_FundsRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_KiroFundingUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "by",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "activator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_KiroPriceUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "by",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timeLength",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_KiroPriceWindowUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "by",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_KiroboWalletUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "by",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxBatchedForFree",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_MaxBatchedForFreeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "by",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxBatche",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_MaxBatchedUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "by",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minStaking",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_MinStakingUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "by",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "activator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "builder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "activatorFees",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "builderPayement",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "calcGas",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "gasPrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_NoPayerActivated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "kiro",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "eth",
            type: "uint96",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Balance",
        name: "staking",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "kiro",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "eth",
            type: "uint96",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Balance",
        name: "amount",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_StakingAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "kiro",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "eth",
            type: "uint96",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Balance",
        name: "staking",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint96",
            name: "kiro",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "eth",
            type: "uint96",
          },
        ],
        indexed: false,
        internalType: "struct IFCT_ActuatorStorage.Balance",
        name: "amount",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_StakingRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "by",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes7",
        name: "id",
        type: "bytes7",
      },
      {
        indexed: true,
        internalType: "address",
        name: "tokenomics",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FCTE_TokenomicsUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "address",
        name: "activator",
        type: "address",
      },
    ],
    name: "activate",
    outputs: [
      {
        internalType: "uint256",
        name: "activatorPaymentOrFees",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
      {
        internalType: "address",
        name: "activator",
        type: "address",
      },
    ],
    name: "activateBatch",
    outputs: [
      {
        internalType: "uint256[]",
        name: "ret",
        type: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "address",
        name: "activator",
        type: "address",
      },
    ],
    name: "activateForFree",
    outputs: [
      {
        internalType: "uint256",
        name: "activatorPaymentOrFees",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
      {
        internalType: "address",
        name: "activator",
        type: "address",
      },
    ],
    name: "activateForFreeBatch",
    outputs: [
      {
        internalType: "uint256[]",
        name: "ret",
        type: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint96",
        name: "kiro",
        type: "uint96",
      },
    ],
    name: "addFunds",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint96",
        name: "amount",
        type: "uint96",
      },
    ],
    name: "addFundsTo",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint96",
        name: "kiro",
        type: "uint96",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
    ],
    name: "getAmountOfEthForGivenKiro",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
    ],
    name: "getAmountOfKiroForGivenEth",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "activator",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isActivationApproved",
    outputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "activate",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "activateBatch",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "activateForFree",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "activateForFreeBatch",
            type: "bool",
          },
        ],
        internalType: "struct IFCT_ActuatorStorage.Approvals",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint96",
        name: "kiro",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "eth",
        type: "uint96",
      },
    ],
    name: "moveFundsFromDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint96",
        name: "kiro",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "eth",
        type: "uint96",
      },
    ],
    name: "moveFundsToDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint96",
        name: "kiro",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "eth",
        type: "uint96",
      },
    ],
    name: "removeFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "s_balances",
    outputs: [
      {
        internalType: "uint96",
        name: "token",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "native",
        type: "uint96",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
    ],
    name: "s_builders",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "s_ethPenalty",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "s_kiroFunding",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "s_kirobo",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "s_maxBatched",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "s_maxBatchedForFree",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "s_minStaking",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "s_staked",
    outputs: [
      {
        internalType: "uint96",
        name: "kiro",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "eth",
        type: "uint96",
      },
      {
        internalType: "uint64",
        name: "blockNumber",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes7",
        name: "",
        type: "bytes7",
      },
    ],
    name: "s_tokenomics",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "s_totalStaked",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        components: [
          {
            internalType: "bool",
            name: "activate",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "activateBatch",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "activateForFree",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "activateForFreeBatch",
            type: "bool",
          },
        ],
        internalType: "struct IFCT_ActuatorStorage.Approvals",
        name: "approvals",
        type: "tuple",
      },
    ],
    name: "setActivationApproval",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "builder",
        type: "address",
      },
    ],
    name: "setBuilder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "kiroPriceBPS",
        type: "uint32",
      },
    ],
    name: "setEthMatchup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "pause",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "freeze",
        type: "bool",
      },
    ],
    name: "setEthState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "kiroFunding",
        type: "address",
      },
    ],
    name: "setKiroFunding",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "kirobo",
        type: "address",
      },
    ],
    name: "setKiroboWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxBatched",
        type: "uint256",
      },
    ],
    name: "setMaxBatched",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxBatchedForFree",
        type: "uint256",
      },
    ],
    name: "setMaxBatchedForFree",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "minStaking",
        type: "uint256",
      },
    ],
    name: "setMinStaking",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes7",
        name: "id",
        type: "bytes7",
      },
      {
        internalType: "address",
        name: "tokenomics",
        type: "address",
      },
    ],
    name: "setTokenomics",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "time",
        type: "uint256",
      },
    ],
    name: "updateTimeBetweenKiroPriceUpdate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint96",
        name: "kiro",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "eth",
        type: "uint96",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

dotenv.config();

const randAddr = () => ethers.Wallet.createRandom().address;

// const chainId = 1;
const chainId = 42161;
const actuator = scriptData[chainId].Actuator;
// const startBlock = 17768601;
const startBlock = 121746953;
const batchSize = 75000;

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(scriptData[chainId].rpcUrl);
  const latestBlock = await provider.getBlockNumber();
  console.log(`Latest block: ${latestBlock}`);

  const IActuator = new ethers.utils.Interface(ABI);

  // We need to fetch all the past logs from the startBlock and
  // collect all the addresses that have interacted with the contract
  // Event - FCTE_FundsAdded
  // Fetch in batches of 1000 blocks
  // We will use a Set to store the addresses

  const addresses = new Set<string>();
  if (existsSync(`scripts/actuator/addresses_${chainId}.json`)) {
    const data = readFileSync(`actuator/addresses_${chainId}.json`, "utf-8");
    const parsedData = JSON.parse(data);
    parsedData.forEach((address: string) => {
      addresses.add(address);
    });
  } else {
    const eventTopic = IActuator.getEventTopic("FCTE_FundsAdded");
    console.log(`Event topic: ${eventTopic}`);
    for (let i = startBlock; i < latestBlock; i += batchSize) {
      const toBlock = Math.min(i + batchSize, latestBlock);
      console.log(`Fetching logs from block ${i} to ${toBlock}`);
      const logs = await provider.getLogs({
        address: actuator,
        fromBlock: i,
        toBlock: toBlock,
        topics: [eventTopic],
      });
      console.log(`Fetched ${logs.length} logs`);
      logs.forEach((log) => {
        const decodedLog = IActuator.decodeEventLog("FCTE_FundsAdded", log.data, log.topics);
        addresses.add(decodedLog.from);
        addresses.add(decodedLog.to);
      });
    }

    writeFileSync(`scripts/actuator/addresses_${chainId}.json`, JSON.stringify(Array.from(addresses), null, 2));
  }

  const addressesArray = Array.from(addresses);

  // Then for every address in the set we need to call Actuator.s_balances[address].
  // Store every address in a map and then write it to a file
  const balances = new Map<string, any>();
  const ActuatorContract = new ethers.Contract(actuator, ABI, provider);
  for (const address of addressesArray) {
    const balance = await ActuatorContract.s_balances(address);
    balances.set(address, {
      token: balance.token.toString(),
      native: balance.native.toString(),
    });
  }
  const mapAsObj = Array.from(balances, ([address, { token, native }]) => ({ address, token, native }));

  writeFileSync(`scripts/actuator/balances_${chainId}.json`, JSON.stringify(mapAsObj, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
