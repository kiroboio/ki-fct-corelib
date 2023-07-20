import { getPlugin as getPlugin$1 } from '@kiroboio/fct-plugins';
export * from '@kiroboio/fct-plugins';
export { utils as pluginUtils } from '@kiroboio/fct-plugins';
import { ethers, utils as utils$1, BigNumber } from 'ethers';
export { ethers } from 'ethers';
import _ from 'lodash';
import { TypedDataUtils, signTypedData, SignTypedDataVersion, recoverTypedSignature } from '@metamask/eth-sig-util';
import { Graph } from 'graphlib';
import util from 'util';

var Flow;
(function (Flow) {
    Flow["OK_CONT_FAIL_REVERT"] = "OK_CONT_FAIL_REVERT";
    Flow["OK_CONT_FAIL_STOP"] = "OK_CONT_FAIL_STOP";
    Flow["OK_CONT_FAIL_CONT"] = "OK_CONT_FAIL_CONT";
    Flow["OK_REVERT_FAIL_CONT"] = "OK_REVERT_FAIL_CONT";
    Flow["OK_REVERT_FAIL_STOP"] = "OK_REVERT_FAIL_STOP";
    Flow["OK_STOP_FAIL_CONT"] = "OK_STOP_FAIL_CONT";
    Flow["OK_STOP_FAIL_REVERT"] = "OK_STOP_FAIL_REVERT";
    Flow["OK_STOP_FAIL_STOP"] = "OK_STOP_FAIL_STOP";
})(Flow || (Flow = {}));
const flows = {
    OK_CONT_FAIL_REVERT: {
        text: "continue on success, revert on fail",
        value: "0",
    },
    OK_CONT_FAIL_STOP: {
        text: "continue on success, stop on fail",
        value: "1",
    },
    OK_CONT_FAIL_CONT: {
        text: "continue on success, continue on fail",
        value: "2",
    },
    OK_REVERT_FAIL_CONT: {
        text: "revert on success, continue on fail",
        value: "3",
    },
    OK_REVERT_FAIL_STOP: {
        text: "revert on success, stop on fail",
        value: "4",
    },
    OK_STOP_FAIL_CONT: {
        text: "stop on success, continue on fail",
        value: "5",
    },
    OK_STOP_FAIL_REVERT: {
        text: "stop on success, revert on fail",
        value: "6",
    },
    OK_STOP_FAIL_STOP: {
        text: "stop on success, stop on fail",
        value: "7",
    },
};

const multicallContracts = {
    1: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
    5: "0x77dCa2C955b15e9dE4dbBCf1246B4B85b651e50e",
};
const nullValue = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";
const FCBase = "0xFC00000000000000000000000000000000000000";
const FCBaseBytes = "0xFC00000000000000000000000000000000000000000000000000000000000000";
const FDBase = "0xFD00000000000000000000000000000000000000";
const FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";
const FDBackBase = "0xFDB0000000000000000000000000000000000000";
const FDBackBaseBytes = "0xFDB0000000000000000000000000000000000000000000000000000000000000";
const ComputedBase = "0xFE00000000000000000000000000000000000000";
const ComputedBaseBytes = "0xFE00000000000000000000000000000000000000000000000000000000000000";
const CALL_TYPE = {
    ACTION: "0",
    VIEW_ONLY: "1",
    LIBRARY: "2",
};
const CALL_TYPE_MSG = {
    ACTION: "action",
    VIEW_ONLY: "view only",
    LIBRARY: "library",
};
// Reverse Call Type MSG
const CALL_TYPE_MSG_REV = {
    action: "ACTION",
    "view only": "VIEW_ONLY",
    library: "LIBRARY",
};
const FCT_VAULT_ADDRESS = "FCT_VAULT_ADDRESS";

var index$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CALL_TYPE: CALL_TYPE,
    CALL_TYPE_MSG: CALL_TYPE_MSG,
    CALL_TYPE_MSG_REV: CALL_TYPE_MSG_REV,
    ComputedBase: ComputedBase,
    ComputedBaseBytes: ComputedBaseBytes,
    FCBase: FCBase,
    FCBaseBytes: FCBaseBytes,
    FCT_VAULT_ADDRESS: FCT_VAULT_ADDRESS,
    FDBackBase: FDBackBase,
    FDBackBaseBytes: FDBackBaseBytes,
    FDBase: FDBase,
    FDBaseBytes: FDBaseBytes,
    get Flow () { return Flow; },
    multicallContracts: multicallContracts,
    nullValue: nullValue
});

var ERC20ABI = [
	{
		constant: true,
		inputs: [
		],
		name: "name",
		outputs: [
			{
				name: "",
				type: "string"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				name: "_spender",
				type: "address"
			},
			{
				name: "_value",
				type: "uint256"
			}
		],
		name: "approve",
		outputs: [
			{
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "totalSupply",
		outputs: [
			{
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				name: "_from",
				type: "address"
			},
			{
				name: "_to",
				type: "address"
			},
			{
				name: "_value",
				type: "uint256"
			}
		],
		name: "transferFrom",
		outputs: [
			{
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "decimals",
		outputs: [
			{
				name: "",
				type: "uint8"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				name: "_owner",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				name: "balance",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: true,
		inputs: [
		],
		name: "symbol",
		outputs: [
			{
				name: "",
				type: "string"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		constant: false,
		inputs: [
			{
				name: "_to",
				type: "address"
			},
			{
				name: "_value",
				type: "uint256"
			}
		],
		name: "transfer",
		outputs: [
			{
				name: "",
				type: "bool"
			}
		],
		payable: false,
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		constant: true,
		inputs: [
			{
				name: "_owner",
				type: "address"
			},
			{
				name: "_spender",
				type: "address"
			}
		],
		name: "allowance",
		outputs: [
			{
				name: "",
				type: "uint256"
			}
		],
		payable: false,
		stateMutability: "view",
		type: "function"
	},
	{
		payable: true,
		stateMutability: "payable",
		type: "fallback"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				name: "spender",
				type: "address"
			},
			{
				indexed: false,
				name: "value",
				type: "uint256"
			}
		],
		name: "Approval",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				name: "value",
				type: "uint256"
			}
		],
		name: "Transfer",
		type: "event"
	}
];

var FCTActuatorABI = [
	{
		inputs: [
			{
				internalType: "address",
				name: "actuatorCore",
				type: "address"
			}
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "activator",
				type: "address"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "address",
				name: "builder",
				type: "address"
			},
			{
				components: [
					{
						internalType: "uint256",
						name: "kiroboPayment",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "builderPayment",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "activatorPayment",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "base",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "fees",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "commonGas",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "userGas",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "missingKiro",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "availableEth",
						type: "uint256"
					}
				],
				indexed: false,
				internalType: "struct Total",
				name: "total",
				type: "tuple"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "gasPrice",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_Activated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "payer",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "builder",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "call",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "totalKiroFees",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "kiroPayed",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "ethPayed",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "builderPayment",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "activatorPayment",
				type: "uint256"
			}
		],
		name: "FCTE_CallPayment",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "activator",
				type: "address"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "activatorFees",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "calcGas",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "gasPrice",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_ForFreeActivated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "activator",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "price",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_KiroPriceUpdated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "by",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "activator",
				type: "address"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "address",
				name: "builder",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "activatorFees",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "builderPayement",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "calcGas",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "gasPrice",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_NoPayerActivated",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "previousAdminRole",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "newAdminRole",
				type: "bytes32"
			}
		],
		name: "RoleAdminChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			}
		],
		name: "RoleGranted",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			}
		],
		name: "RoleRevoked",
		type: "event"
	},
	{
		stateMutability: "payable",
		type: "fallback"
	},
	{
		inputs: [
		],
		name: "ACTUATOR_CORE",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "DAO_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "DAO_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "DEFAULT_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "FCT_CONTROLLER",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "KIRO",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "MANAGER_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "MANAGER_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "PROTECTOR_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "PROTECTOR_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "TOKEN_0",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "TOKEN_1",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			},
			{
				internalType: "address",
				name: "activator",
				type: "address"
			}
		],
		name: "activate",
		outputs: [
			{
				internalType: "uint256",
				name: "activatorPaymentOrFees",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes[]",
				name: "data",
				type: "bytes[]"
			},
			{
				internalType: "address",
				name: "activator",
				type: "address"
			}
		],
		name: "activateBatch",
		outputs: [
			{
				internalType: "uint256[]",
				name: "ret",
				type: "uint256[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			},
			{
				internalType: "address",
				name: "activator",
				type: "address"
			}
		],
		name: "activateForFree",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes[]",
				name: "data",
				type: "bytes[]"
			},
			{
				internalType: "address",
				name: "activator",
				type: "address"
			}
		],
		name: "activateForFreeBatch",
		outputs: [
			{
				internalType: "uint256[]",
				name: "ret",
				type: "uint256[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			}
		],
		name: "getAmountOfEthForGivenKiro",
		outputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "amountIn",
				type: "uint256"
			}
		],
		name: "getAmountOfKiroForGivenEth",
		outputs: [
			{
				internalType: "uint256",
				name: "amountOut",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			}
		],
		name: "getRoleAdmin",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "grantRole",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "hasRole",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "activator",
				type: "address"
			},
			{
				internalType: "address",
				name: "operator",
				type: "address"
			}
		],
		name: "isActivationApproved",
		outputs: [
			{
				components: [
					{
						internalType: "bool",
						name: "activate",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "activateBatch",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "activateForFree",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "activateForFreeBatch",
						type: "bool"
					}
				],
				internalType: "struct IFCT_ActuatorStorage.Approvals",
				name: "",
				type: "tuple"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "renounceRole",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "revokeRole",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "s_activation_approvals",
		outputs: [
			{
				internalType: "bool",
				name: "activate",
				type: "bool"
			},
			{
				internalType: "bool",
				name: "activateBatch",
				type: "bool"
			},
			{
				internalType: "bool",
				name: "activateForFree",
				type: "bool"
			},
			{
				internalType: "bool",
				name: "activateForFreeBatch",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "s_balances",
		outputs: [
			{
				internalType: "uint96",
				name: "kiro",
				type: "uint96"
			},
			{
				internalType: "uint96",
				name: "eth",
				type: "uint96"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_blockTimestampLast",
		outputs: [
			{
				internalType: "uint32",
				name: "",
				type: "uint32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		name: "s_builders",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_ethPenalty",
		outputs: [
			{
				internalType: "uint32",
				name: "kiroPriceBPS",
				type: "uint32"
			},
			{
				internalType: "bool",
				name: "paused",
				type: "bool"
			},
			{
				internalType: "bool",
				name: "freezed",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_forFreeFeesLimitBPS",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_kiroFunding",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_kirobo",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_lastUpdateDateOfPrice",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_maxBatched",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_maxBatchedForFree",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_minStaking",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_price0Average",
		outputs: [
			{
				internalType: "uint224",
				name: "_x",
				type: "uint224"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_price0CumulativeLast",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_price1Average",
		outputs: [
			{
				internalType: "uint224",
				name: "_x",
				type: "uint224"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_price1CumulativeLast",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "s_staked",
		outputs: [
			{
				internalType: "uint96",
				name: "kiro",
				type: "uint96"
			},
			{
				internalType: "uint96",
				name: "eth",
				type: "uint96"
			},
			{
				internalType: "uint64",
				name: "blockNumber",
				type: "uint64"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_timeBetweenKiroPriceUpdate",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes7",
				name: "",
				type: "bytes7"
			}
		],
		name: "s_tokenomics",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_totalStaked",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes4",
				name: "interfaceId",
				type: "bytes4"
			}
		],
		name: "supportsInterface",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "updateKiroPrice",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		stateMutability: "payable",
		type: "receive"
	}
];

var FCTBatchMultiSigCallABI = [
	{
		inputs: [
			{
				internalType: "address",
				name: "controller",
				type: "address"
			},
			{
				internalType: "address",
				name: "authenticator",
				type: "address"
			}
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "caller",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "callIndex",
				type: "uint256"
			}
		],
		name: "FCTE_CallFailed",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "caller",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "callIndex",
				type: "uint256"
			}
		],
		name: "FCTE_CallSucceed",
		type: "event"
	},
	{
		inputs: [
		],
		name: "AUTHENTICATOR",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "BATCH_MULTI_SIG_CALL_ID",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "CONTROLLER",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "VERSION",
		outputs: [
			{
				internalType: "bytes3",
				name: "",
				type: "bytes3"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			},
			{
				internalType: "uint256[]",
				name: "types",
				type: "uint256[]"
			},
			{
				internalType: "bytes32[]",
				name: "typedHashes",
				type: "bytes32[]"
			},
			{
				components: [
					{
						internalType: "uint256",
						name: "data",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "types",
						type: "uint256"
					}
				],
				internalType: "struct FCT_BatchMultiSig.Offset",
				name: "offset",
				type: "tuple"
			}
		],
		name: "abiToEIP712",
		outputs: [
			{
				internalType: "bytes",
				name: "res",
				type: "bytes"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "version",
				type: "bytes32"
			},
			{
				components: [
					{
						internalType: "bytes32",
						name: "typeHash",
						type: "bytes32"
					},
					{
						internalType: "uint256",
						name: "sessionId",
						type: "uint256"
					},
					{
						internalType: "bytes32",
						name: "nameHash",
						type: "bytes32"
					},
					{
						internalType: "address",
						name: "builder",
						type: "address"
					},
					{
						components: [
							{
								internalType: "bytes32",
								name: "typeHash",
								type: "bytes32"
							},
							{
								internalType: "bytes32",
								name: "ensHash",
								type: "bytes32"
							},
							{
								internalType: "bytes32",
								name: "functionSignature",
								type: "bytes32"
							},
							{
								internalType: "uint256",
								name: "value",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "callId",
								type: "uint256"
							},
							{
								internalType: "address",
								name: "from",
								type: "address"
							},
							{
								internalType: "address",
								name: "to",
								type: "address"
							},
							{
								internalType: "bytes",
								name: "data",
								type: "bytes"
							},
							{
								internalType: "uint256[]",
								name: "types",
								type: "uint256[]"
							},
							{
								internalType: "bytes32[]",
								name: "typedHashes",
								type: "bytes32[]"
							}
						],
						internalType: "struct FCT_BatchMultiSig.MSCall[]",
						name: "mcall",
						type: "tuple[]"
					},
					{
						components: [
							{
								internalType: "bytes32",
								name: "r",
								type: "bytes32"
							},
							{
								internalType: "bytes32",
								name: "s",
								type: "bytes32"
							},
							{
								internalType: "uint8",
								name: "v",
								type: "uint8"
							}
						],
						internalType: "struct FCT_BatchMultiSig.Signature[]",
						name: "signatures",
						type: "tuple[]"
					},
					{
						internalType: "bytes32[]",
						name: "variables",
						type: "bytes32[]"
					},
					{
						internalType: "address[]",
						name: "externalSigners",
						type: "address[]"
					},
					{
						components: [
							{
								internalType: "uint256",
								name: "value",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "add",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "sub",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "mul",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "pow",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "div",
								type: "uint256"
							},
							{
								internalType: "uint256",
								name: "mod",
								type: "uint256"
							}
						],
						internalType: "struct FCT_BatchMultiSig.Computed[]",
						name: "computed",
						type: "tuple[]"
					}
				],
				internalType: "struct FCT_BatchMultiSig.MSCalls",
				name: "tr",
				type: "tuple"
			},
			{
				internalType: "bytes32",
				name: "purgeFCT",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "investor",
				type: "address"
			},
			{
				internalType: "address",
				name: "activator",
				type: "address"
			}
		],
		name: "batchMultiSigCall",
		outputs: [
			{
				internalType: "bytes32",
				name: "name",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "builder",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "maxGasPrice",
				type: "uint256"
			},
			{
				components: [
					{
						internalType: "address",
						name: "payer",
						type: "address"
					},
					{
						internalType: "uint88",
						name: "gas",
						type: "uint88"
					}
				],
				internalType: "struct MReturn[]",
				name: "rt",
				type: "tuple[]"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "getIDs",
		outputs: [
			{
				internalType: "bytes32[]",
				name: "res",
				type: "bytes32[]"
			}
		],
		stateMutability: "pure",
		type: "function"
	}
];

var FCTControllerABI = [
	{
		inputs: [
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "impl",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_EngineAdded",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "ens",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "prevEns",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_EnsManagerChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "messageHash",
				type: "bytes32"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "meta",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_Purged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "messageHash",
				type: "bytes32"
			},
			{
				components: [
					{
						internalType: "uint8",
						name: "flags",
						type: "uint8"
					},
					{
						internalType: "uint40",
						name: "expiresAt",
						type: "uint40"
					},
					{
						internalType: "uint40",
						name: "starttime",
						type: "uint40"
					},
					{
						internalType: "uint40",
						name: "lasttime",
						type: "uint40"
					},
					{
						internalType: "uint40",
						name: "timestamp",
						type: "uint40"
					},
					{
						internalType: "uint16",
						name: "repeatsLeft",
						type: "uint16"
					},
					{
						internalType: "uint16",
						name: "maxRepeats",
						type: "uint16"
					},
					{
						internalType: "bytes7",
						name: "engineId",
						type: "bytes7"
					},
					{
						internalType: "uint32",
						name: "chilltime",
						type: "uint32"
					},
					{
						internalType: "uint224",
						name: "reserved1",
						type: "uint224"
					},
					{
						internalType: "uint256",
						name: "reserved2",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "reserved3",
						type: "uint256"
					}
				],
				indexed: false,
				internalType: "struct FCT_Controller.Meta",
				name: "meta",
				type: "tuple"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256"
			}
		],
		name: "FCTE_Registered",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "previousAdminRole",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "newAdminRole",
				type: "bytes32"
			}
		],
		name: "RoleAdminChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			}
		],
		name: "RoleGranted",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			}
		],
		name: "RoleRevoked",
		type: "event"
	},
	{
		stateMutability: "nonpayable",
		type: "fallback"
	},
	{
		inputs: [
		],
		name: "ACTIVATION_ID_MASK",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "ACTUATOR_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "ACTUATOR_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "CHAIN_ID",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "DEFAULT_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "DOMAIN_SEPARATOR",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "EMPTY_HASH",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "ENS_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "ENS_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "ID_VERSION_MASK",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "LOCAL_ENS_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "LOCAL_ENS_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "META_ACCUMATABLE_FLAG",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "META_BLOCKABLE_FLAG",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "META_EIP712_FLAG",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "META_PURGABLE_FLAG",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "NAME",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "TARGET_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "TARGET_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "UID",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "VERSION",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "VERSION_NUMBER",
		outputs: [
			{
				internalType: "uint8",
				name: "",
				type: "uint8"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			}
		],
		name: "activationId",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			}
		],
		name: "activationInfo",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			},
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_engine",
				type: "address"
			}
		],
		name: "addEngine",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			}
		],
		name: "engine",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "messageHash",
				type: "bytes32"
			}
		],
		name: "getFctMeta",
		outputs: [
			{
				components: [
					{
						internalType: "uint8",
						name: "flags",
						type: "uint8"
					},
					{
						internalType: "uint40",
						name: "expiresAt",
						type: "uint40"
					},
					{
						internalType: "uint40",
						name: "starttime",
						type: "uint40"
					},
					{
						internalType: "uint40",
						name: "lasttime",
						type: "uint40"
					},
					{
						internalType: "uint40",
						name: "timestamp",
						type: "uint40"
					},
					{
						internalType: "uint16",
						name: "repeatsLeft",
						type: "uint16"
					},
					{
						internalType: "uint16",
						name: "maxRepeats",
						type: "uint16"
					},
					{
						internalType: "bytes7",
						name: "engineId",
						type: "bytes7"
					},
					{
						internalType: "uint32",
						name: "chilltime",
						type: "uint32"
					},
					{
						internalType: "uint224",
						name: "reserved1",
						type: "uint224"
					},
					{
						internalType: "uint256",
						name: "reserved2",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "reserved3",
						type: "uint256"
					}
				],
				internalType: "struct FCT_Controller.Meta",
				name: "",
				type: "tuple"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			}
		],
		name: "getRoleAdmin",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "grantRole",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "hasRole",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			}
		],
		name: "isExecuting",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "messageHash",
				type: "bytes32"
			}
		],
		name: "isExecutingFCT",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				internalType: "bytes32[]",
				name: "messageHashes",
				type: "bytes32[]"
			}
		],
		name: "purge",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "dataHash",
				type: "bytes32"
			},
			{
				components: [
					{
						internalType: "uint40",
						name: "expiresAt",
						type: "uint40"
					},
					{
						internalType: "uint32",
						name: "chilltime",
						type: "uint32"
					},
					{
						internalType: "uint16",
						name: "maxRepeats",
						type: "uint16"
					},
					{
						internalType: "bool",
						name: "accumatable",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "eip712",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "purgeable",
						type: "bool"
					},
					{
						internalType: "bool",
						name: "blockable",
						type: "bool"
					},
					{
						internalType: "uint8",
						name: "extraFlags",
						type: "uint8"
					},
					{
						internalType: "uint224",
						name: "reserved1",
						type: "uint224"
					},
					{
						internalType: "uint256",
						name: "reserved2",
						type: "uint256"
					},
					{
						internalType: "uint256",
						name: "reserved3",
						type: "uint256"
					}
				],
				internalType: "struct MetaInput",
				name: "meta",
				type: "tuple"
			}
		],
		name: "register",
		outputs: [
			{
				internalType: "bytes32",
				name: "messageHash",
				type: "bytes32"
			},
			{
				internalType: "uint256",
				name: "newMeta",
				type: "uint256"
			},
			{
				internalType: "bytes32",
				name: "newActivationId",
				type: "bytes32"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "renounceRole",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "revokeRole",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		name: "s_activations",
		outputs: [
			{
				internalType: "uint248",
				name: "nonce",
				type: "uint248"
			},
			{
				internalType: "bool",
				name: "executing",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		name: "s_engines",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_ensManager",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "s_executing",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		name: "s_fcts",
		outputs: [
			{
				internalType: "uint8",
				name: "flags",
				type: "uint8"
			},
			{
				internalType: "uint40",
				name: "expiresAt",
				type: "uint40"
			},
			{
				internalType: "uint40",
				name: "starttime",
				type: "uint40"
			},
			{
				internalType: "uint40",
				name: "lasttime",
				type: "uint40"
			},
			{
				internalType: "uint40",
				name: "timestamp",
				type: "uint40"
			},
			{
				internalType: "uint16",
				name: "repeatsLeft",
				type: "uint16"
			},
			{
				internalType: "uint16",
				name: "maxRepeats",
				type: "uint16"
			},
			{
				internalType: "bytes7",
				name: "engineId",
				type: "bytes7"
			},
			{
				internalType: "uint32",
				name: "chilltime",
				type: "uint32"
			},
			{
				internalType: "uint224",
				name: "reserved1",
				type: "uint224"
			},
			{
				internalType: "uint256",
				name: "reserved2",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "reserved3",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "ensManager",
				type: "address"
			}
		],
		name: "setEnsManager",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes4",
				name: "interfaceId",
				type: "bytes4"
			}
		],
		name: "supportsInterface",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "_engine",
				type: "address"
			},
			{
				internalType: "bytes32",
				name: "ensHash",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "expectedAddress",
				type: "address"
			}
		],
		name: "verifiedEnsToAddress",
		outputs: [
			{
				internalType: "address",
				name: "dest",
				type: "address"
			},
			{
				internalType: "uint8",
				name: "ensType",
				type: "uint8"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32"
			}
		],
		name: "version",
		outputs: [
			{
				internalType: "bytes3",
				name: "",
				type: "bytes3"
			}
		],
		stateMutability: "view",
		type: "function"
	}
];

const MulticallABI = [
    "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
];
class Interfaces {
    static FCT_Controller = new ethers.utils.Interface(FCTControllerABI);
    static FCT_BatchMultiSigCall = new ethers.utils.Interface(FCTBatchMultiSigCallABI);
    static FCT_Actuator = new ethers.utils.Interface(FCTActuatorABI);
    static Multicall = new ethers.utils.Interface(MulticallABI);
    static ERC20 = new ethers.utils.Interface(ERC20ABI);
}

class FetchUtility {
    chainId;
    multicallContract;
    constructor({ rpcUrl, chainId, provider }) {
        if (!provider) {
            if (!rpcUrl) {
                throw new Error("No provider or rpcUrl provided");
            }
            provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        }
        if (typeof chainId === "string") {
            chainId = Number(chainId);
        }
        this.chainId = chainId;
        if (!multicallContracts[Number(chainId)]) {
            throw new Error("Multicall contract not found for this chain");
        }
        this.multicallContract = new ethers.Contract(multicallContracts[Number(chainId)], Interfaces.Multicall, provider);
    }
    async fetchCurrentApprovals(data) {
        const multicallContract = this.multicallContract;
        return await fetchCurrentApprovals({
            data,
            multicallContract,
            chainId: this.chainId,
            provider: multicallContract.provider,
        });
    }
    async getTokensTotalSupply(requiredApprovals) {
        // Filter all tokens that are not ERC20 and duplicate tokens
        const erc20Tokens = requiredApprovals.filter((approval) => approval.protocol === "ERC20");
        const ERC20Interface = new ethers.utils.Interface(["function totalSupply() view returns (uint256)"]);
        const calls = erc20Tokens.map(({ token: target }) => {
            return {
                target,
                callData: ERC20Interface.encodeFunctionData("totalSupply"),
            };
        });
        const [, returnData] = await this.multicallContract.callStatic.aggregate(calls);
        return returnData.reduce((acc, res, index) => {
            const decoded = ERC20Interface.decodeFunctionResult("totalSupply", res);
            acc[calls[index].target] = decoded[0].toString();
            return acc;
        }, {});
    }
}

const fetchApprovalsInterface = new ethers.utils.Interface([
    "function allowance(address owner, address spender) view returns (uint256)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
]);
const generateDataForCall = (data) => {
    if (data.protocol === "ERC20") {
        if (data.method === "approve") {
            return {
                functionName: "allowance",
                encodedData: fetchApprovalsInterface.encodeFunctionData("allowance", [data.from, data.params.spender]),
            };
        }
    }
    if (data.protocol === "ERC721") {
        if (data.method === "approve") {
            return {
                functionName: "getApproved",
                encodedData: fetchApprovalsInterface.encodeFunctionData("getApproved", [data.params.tokenId]),
            };
        }
    }
    if (data.method === "setApprovalForAll") {
        return {
            functionName: "isApprovedForAll",
            encodedData: fetchApprovalsInterface.encodeFunctionData("isApprovedForAll", [data.from, data.params.spender]),
        };
    }
};
const fetchCurrentApprovals = async ({ rpcUrl, provider, chainId, multicallContract, multicallContractAddress, data, }) => {
    if (!provider) {
        if (!rpcUrl) {
            throw new Error("No provider or rpcUrl provided");
        }
        provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    }
    chainId = chainId || (await provider.getNetwork()).chainId.toString();
    if (!multicallContract) {
        multicallContractAddress =
            multicallContractAddress ?? multicallContracts[Number(chainId)];
        if (!multicallContractAddress) {
            throw new Error("Multicall contract not found for this chain");
        }
        multicallContract = new ethers.Contract(multicallContractAddress, Interfaces.Multicall, provider);
    }
    const calls = data.map((approval) => {
        const dataOfCall = generateDataForCall(approval);
        if (!dataOfCall) {
            throw new Error("Approval not found");
        }
        const { functionName, encodedData } = dataOfCall;
        return {
            functionName,
            dataForMulticall: {
                target: approval.token,
                callData: encodedData,
            },
        };
    });
    const [, returnData] = await multicallContract.callStatic.aggregate(calls.map((call) => call.dataForMulticall));
    return returnData.map((res, index) => {
        const functionName = calls[index].functionName;
        const decoded = fetchApprovalsInterface.decodeFunctionResult(functionName, res);
        return {
            ...data[index],
            value: functionName === "allowance" ? decoded[0].toString() : decoded[0],
        };
    });
};

const gasPriceCalculationsByChains = {
    5: (maxFeePerGas) => {
        // If maxFeePerGas < 70 gwei, add 15% to maxFeePerGas
        if (maxFeePerGas < 70_000_000_000) {
            return Math.round(maxFeePerGas + maxFeePerGas * 0.15);
        }
        // If maxFeePerGas < 100 gwei, add 10% to maxFeePerGas
        if (maxFeePerGas < 100_000_000_000) {
            return Math.round(maxFeePerGas + maxFeePerGas * 0.1);
        }
        // If maxFeePerGas > 200 gwei, add 5% to maxFeePerGas
        if (maxFeePerGas > 200_000_000_000) {
            return Math.round(maxFeePerGas + maxFeePerGas * 0.05);
        }
        return maxFeePerGas;
    },
    1: (maxFeePerGas) => maxFeePerGas,
};
const getGasPrices = async ({ rpcUrl, chainId, historicalBlocks = 10, tries = 40, }) => {
    function avg(arr) {
        const sum = arr.reduce((a, v) => a + v);
        return Math.round(sum / arr.length);
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    let keepTrying = true;
    let returnValue;
    do {
        try {
            const latestBlock = await provider.getBlock("latest");
            if (!latestBlock.baseFeePerGas) {
                throw new Error("No baseFeePerGas");
            }
            const baseFee = latestBlock.baseFeePerGas.toString();
            const blockNumber = latestBlock.number;
            const generateBody = () => {
                return JSON.stringify({
                    jsonrpc: "2.0",
                    method: "eth_feeHistory",
                    params: [historicalBlocks, `0x${blockNumber.toString(16)}`, [2, 5, 15, 25]],
                    id: 1,
                });
            };
            const res = await fetch(rpcUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: generateBody(),
            });
            const data = await res.json();
            const result = data.result;
            if (!result) {
                throw new Error("No result");
            }
            let blockNum = parseInt(result.oldestBlock, 16);
            let index = 0;
            const blocks = [];
            while (blockNum < parseInt(result.oldestBlock, 16) + historicalBlocks) {
                blocks.push({
                    number: blockNum,
                    baseFeePerGas: Number(result.baseFeePerGas[index]),
                    gasUsedRatio: Number(result.gasUsedRatio[index]),
                    priorityFeePerGas: result.reward[index].map((x) => Number(x)),
                });
                blockNum += 1;
                index += 1;
            }
            const slow = avg(blocks.map((b) => b.priorityFeePerGas[0]));
            const average = avg(blocks.map((b) => b.priorityFeePerGas[1]));
            // Add 5% to fast and fastest
            const fast = avg(blocks.map((b) => b.priorityFeePerGas[2]));
            const fastest = avg(blocks.map((b) => b.priorityFeePerGas[3]));
            const baseFeePerGas = Number(baseFee);
            const gasPriceCalc = gasPriceCalculationsByChains[chainId] ||
                gasPriceCalculationsByChains[1];
            returnValue = {
                slow: {
                    maxFeePerGas: slow + baseFeePerGas,
                    maxPriorityFeePerGas: slow,
                },
                average: {
                    maxFeePerGas: average + baseFeePerGas,
                    maxPriorityFeePerGas: average,
                },
                fast: {
                    maxFeePerGas: gasPriceCalc(fast + baseFeePerGas),
                    maxPriorityFeePerGas: fast,
                },
                fastest: {
                    maxFeePerGas: gasPriceCalc(fastest + baseFeePerGas),
                    maxPriorityFeePerGas: fastest,
                },
            };
            keepTrying = false;
            return returnValue;
        }
        catch (err) {
            if (tries > 0) {
                // Wait 3 seconds before retrying
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
            else {
                throw new Error("Could not get gas prices, issue might be related to node provider");
            }
        }
    } while (keepTrying && tries-- > 0);
    throw new Error("Could not get gas prices, issue might be related to node provider");
};

const addresses = {
    1: {
        FCT_Controller: "0x0A0ea58E6504aA7bfFf6F3d069Bd175AbAb638ee",
        FCT_BatchMultiSig: "0x6D8E3Dc3a0128A3Bbf852506642C0dF78806859c",
        FCT_EnsManager: "0x30B25912faeb6E9B70c1FD9F395D2fF2083C966C",
        FCT_Tokenomics: "0x4fF4C72506f7E3630b81c619435250bD8aB6c03c",
        Actuator: "0x78b3e89ec2F4D4f1689332059E488835E05045DD",
        ActuatorCore: "0x5E3189755Df3DBB0FD3FeCa3de168fEEDBA76a79",
    },
    5: {
        FCT_Controller: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
        FCT_BatchMultiSig: "0xF7Fa1292f19abE979cE7d2EfF037a7F13F26F4cC",
        FCT_EnsManager: "0xB9DBD91e7cC0A4d7635d18FB33416D784EBe2524",
        FCT_Tokenomics: "0xB09E0B70dffDe2968EBDa24855D05DC7a1663F5C",
        Actuator: "0x905e7a9a0Bb9755938E73A0890d603682DC2cD9C",
        ActuatorCore: "0xD33D02BF33EA0A3FA8eB75c4a23b19452cCcE106",
    },
    42161: {
        // TODO: All the contracts below are copied from Goerli, need to be changed
        FCT_Controller: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
        FCT_BatchMultiSig: "0xF7Fa1292f19abE979cE7d2EfF037a7F13F26F4cC",
        FCT_EnsManager: "0xB9DBD91e7cC0A4d7635d18FB33416D784EBe2524",
        FCT_Tokenomics: "0xB09E0B70dffDe2968EBDa24855D05DC7a1663F5C",
        Actuator: "0x905e7a9a0Bb9755938E73A0890d603682DC2cD9C",
        ActuatorCore: "0xD33D02BF33EA0A3FA8eB75c4a23b19452cCcE106",
    },
    421613: {
        // TODO: All the contracts below are copied from Goerli, need to be changed
        FCT_Controller: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
        FCT_BatchMultiSig: "0xF7Fa1292f19abE979cE7d2EfF037a7F13F26F4cC",
        FCT_EnsManager: "0xB9DBD91e7cC0A4d7635d18FB33416D784EBe2524",
        FCT_Tokenomics: "0xB09E0B70dffDe2968EBDa24855D05DC7a1663F5C",
        Actuator: "0x905e7a9a0Bb9755938E73A0890d603682DC2cD9C",
        ActuatorCore: "0xD33D02BF33EA0A3FA8eB75c4a23b19452cCcE106",
    },
};
const NO_JUMP = "NO_JUMP";
const DEFAULT_CALL_OPTIONS = {
    permissions: "0000",
    gasLimit: "0",
    flow: Flow.OK_CONT_FAIL_REVERT,
    jumpOnSuccess: NO_JUMP,
    jumpOnFail: NO_JUMP,
    falseMeansFail: false,
    callType: "ACTION",
};

const valueWithPadStart$1 = (value, padStart) => {
    return Number(value).toString(16).padStart(padStart, "0");
};
// This is the structure of callId string
// 4 - Permissions
// 2 - Flow
// 4 - Fail Jump
// 4 - Ok Jump
// 4 - Payer index
// 4 - Call index
// 8 - Gas limit
// 2 - Flags
// 0x00000000000000000000000000000000 / 0000 / 05 / 0000 / 0001 / 0001 / 0001 / 00000000 / 00;
class CallID {
    static asString({ calls, call, index }) {
        const permissions = "0000";
        const flow = valueWithPadStart$1(flows[call.options.flow].value, 2);
        const payerIndex = valueWithPadStart$1(call.options.payerIndex, 4);
        const callIndex = valueWithPadStart$1(index + 1, 4);
        const gasLimit = valueWithPadStart$1(call.options.gasLimit, 8);
        const flags = () => {
            const callType = CALL_TYPE[call.options.callType];
            const falseMeansFail = call.options.falseMeansFail ? 4 : 0;
            return callType + (parseInt(callType, 16) + falseMeansFail).toString(16);
        };
        let successJump = "0000";
        let failJump = "0000";
        if (call.options) {
            const { jumpOnFail, jumpOnSuccess } = call.options;
            if (jumpOnFail && jumpOnFail !== NO_JUMP) {
                const nodeIndex = calls.findIndex((c) => c.nodeId === call?.options?.jumpOnFail);
                failJump = Number(nodeIndex - index - 1)
                    .toString(16)
                    .padStart(4, "0");
            }
            if (jumpOnSuccess && jumpOnSuccess !== NO_JUMP) {
                const nodeIndex = calls.findIndex((c) => c.nodeId === call?.options?.jumpOnSuccess);
                successJump = Number(nodeIndex - index - 1)
                    .toString(16)
                    .padStart(4, "0");
            }
        }
        return ("0x" +
            `${permissions}${flow}${failJump}${successJump}${payerIndex}${callIndex}${gasLimit}${flags()}`.padStart(64, "0"));
    }
    static parse(callId) {
        const { permissions, flowNumber, jumpOnFail, jumpOnSuccess, payerIndex, callIndex, gasLimit, flags } = CallID.destructCallId(callId);
        const options = {
            gasLimit,
            flow: CallID.getFlow(flowNumber),
            jumpOnFail: "",
            jumpOnSuccess: "",
        };
        if (jumpOnFail)
            options["jumpOnFail"] = `node${callIndex + jumpOnFail}`;
        if (jumpOnSuccess)
            options["jumpOnSuccess"] = `node${callIndex + jumpOnFail}`;
        return {
            options,
            viewOnly: flags === 1,
            permissions,
            payerIndex,
            callIndex,
        };
    }
    static parseWithNumbers(callId) {
        const { permissions, flowNumber, jumpOnFail, jumpOnSuccess, payerIndex, callIndex, gasLimit, flags } = CallID.destructCallId(callId);
        const options = {
            gasLimit,
            flow: CallID.getFlow(flowNumber),
            jumpOnFail,
            jumpOnSuccess,
        };
        return {
            options,
            viewOnly: flags === 1,
            permissions,
            payerIndex,
            callIndex,
        };
    }
    static destructCallId = (callId) => {
        const permissions = callId.slice(36, 38);
        const flowNumber = parseInt(callId.slice(38, 40), 16);
        const jumpOnFail = parseInt(callId.slice(40, 44), 16);
        const jumpOnSuccess = parseInt(callId.slice(44, 48), 16);
        const payerIndex = parseInt(callId.slice(48, 52), 16);
        const callIndex = parseInt(callId.slice(52, 56), 16);
        const gasLimit = parseInt(callId.slice(56, 64), 16).toString();
        const flags = parseInt(callId.slice(64, 66), 16);
        return {
            permissions,
            flowNumber,
            jumpOnFail,
            jumpOnSuccess,
            payerIndex,
            callIndex,
            gasLimit,
            flags,
        };
    };
    static getFlow = (flowNumber) => {
        const flow = Object.entries(flows).find(([, value]) => {
            return value.value === flowNumber.toString();
        });
        if (!flow)
            throw new Error("Invalid flow");
        return Flow[flow[0]];
    };
}

const getComputedVariableMessage = (computedVariables) => {
    return computedVariables.reduce((acc, item, i) => {
        return {
            ...acc,
            [`computed_${i + 1}`]: item,
        };
    }, {});
};

const instanceOfVariable = (object) => {
    return typeof object === "object" && "type" in object && "id" in object;
};
function instanceOfParams(objectOrArray) {
    if (Array.isArray(objectOrArray)) {
        return instanceOfParams(objectOrArray[0]);
    }
    return typeof objectOrArray === "object" && "type" in objectOrArray && "name" in objectOrArray;
}

const { toUtf8Bytes, defaultAbiCoder } = utils$1;
// From method and params create tuple
const getMethodInterface = (call) => {
    const getParamsType = (param) => {
        if (instanceOfParams(param.value)) {
            if (Array.isArray(param.value[0])) {
                const value = param.value[0];
                return `(${value.map(getParamsType).join(",")})[]`;
            }
            else {
                const value = param.value;
                return `(${value.map(getParamsType).join(",")})`;
            }
        }
        return param.hashed ? "bytes32" : param.type;
    };
    const params = call.params ? call.params.map(getParamsType) : "";
    return `${call.method}(${params})`;
};
const getEncodedMethodParams = (call, withFunction) => {
    if (!call.method)
        return "0x";
    if (withFunction) {
        const ABI = [
            `function ${call.method}(${call.params ? call.params.map((item) => (item.hashed ? "bytes32" : item.type)).join(",") : ""})`,
        ];
        const iface = new utils$1.Interface(ABI);
        return iface.encodeFunctionData(call.method, call.params
            ? call.params.map((item) => {
                if (item.hashed) {
                    if (typeof item.value === "string") {
                        return utils$1.keccak256(toUtf8Bytes(item.value));
                    }
                    throw new Error("Hashed value must be a string");
                }
                return item.value;
            })
            : []);
    }
    const getType = (param) => {
        if (param.customType || param.type.includes("tuple")) {
            let value;
            let isArray = false;
            if (param.type.lastIndexOf("[") > 0) {
                isArray = true;
                value = param.value[0];
            }
            else {
                value = param.value;
            }
            return `(${value.map(getType).join(",")})${isArray ? "[]" : ""}`;
        }
        return param.hashed ? "bytes32" : param.type;
    };
    const getValues = (param) => {
        if (!param.value) {
            throw new Error("Param value is required");
        }
        if (param.customType || param.type.includes("tuple")) {
            let value;
            if (param.type.lastIndexOf("[") > 0) {
                value = param.value;
                return value.reduce((acc, val) => {
                    return [...acc, val.map(getValues)];
                }, []);
            }
            else {
                value = param.value;
                return value.map(getValues);
            }
        }
        if (param.hashed) {
            if (typeof param.value === "string") {
                return utils$1.keccak256(toUtf8Bytes(param.value));
            }
            throw new Error("Hashed value must be a string");
        }
        return param.value;
    };
    if (!call.params)
        return "0x";
    return defaultAbiCoder.encode(call.params.map(getType), call.params.map(getValues));
};

function getDate(days = 0) {
    const result = new Date();
    result.setDate(result.getDate() + days);
    return Number(result.getTime() / 1000).toFixed();
}

const TYPE_NATIVE = 1000;
const TYPE_STRING = 2000;
const TYPE_BYTES = 3000;
const TYPE_ARRAY = 4000;
const TYPE_ARRAY_WITH_LENGTH = 5000; // Example: uint256[2] - [TYPE_ARRAY_WITH_LENGTH, 2, ...rest]
const getFixedArrayLength = (type) => +type.slice(type.indexOf("[") + 1, type.indexOf("]"));
const typeValue = (param) => {
    // If type is an array
    if (param.type.lastIndexOf("[") > 0 && !param.hashed) {
        const value = param.value;
        const countOfElements = value[0].length;
        const TYPE = param.type.indexOf("]") - param.type.indexOf("[") === 1 ? TYPE_ARRAY : TYPE_ARRAY_WITH_LENGTH;
        // If the type is an array of tuple/custom struct
        if (param.customType || param.type.includes("tuple")) {
            const typesArray = getTypesArray(value[0], false);
            if (TYPE === TYPE_ARRAY_WITH_LENGTH) {
                return [TYPE, getFixedArrayLength(param.type), countOfElements, ...typesArray];
            }
            return [TYPE, countOfElements, ...typesArray];
        }
        // Else it is an array with non-custom types
        const parameter = { ...param, type: param.type.slice(0, param.type.lastIndexOf("[")) };
        const insideType = typeValue(parameter);
        if (TYPE === TYPE_ARRAY_WITH_LENGTH) {
            return [TYPE, getFixedArrayLength(param.type), countOfElements, ...insideType];
        }
        return [TYPE, ...insideType];
    }
    // If type is a string
    if (param.type === "string" && !param.hashed) {
        return [TYPE_STRING];
    }
    // If type is bytes
    if (param.type === "bytes" && !param.hashed) {
        return [TYPE_BYTES];
    }
    // If param is custom struct
    if (param.customType || param.type.includes("tuple")) {
        const values = param.value;
        const types = values.reduce((acc, item) => {
            return [...acc, ...typeValue(item)];
        }, []);
        return [values.length, ...types];
    }
    // If all statements above are false, then type is a native type
    return [TYPE_NATIVE];
};
// Get Types array
const getTypesArray = (params, removeNative = true) => {
    const types = params.reduce((acc, item) => {
        const data = typeValue(item);
        return [...acc, ...data];
    }, []);
    if (removeNative && !types.some((item) => item !== TYPE_NATIVE)) {
        return [];
    }
    return types;
};

const handleMethodInterface = (call) => {
    if (call.method) {
        return getMethodInterface(call);
    }
    return "";
};
const handleFunctionSignature = (call) => {
    if (call.method) {
        const value = getMethodInterface(call);
        return utils$1.id(value);
    }
    return nullValue;
};
// export const handleEnsHash = (call: IMSCallInput) => {
//   if (call.toENS) {
//     return utils.id(call.toENS);
//   }
//   return nullValue;
// };
const handleData = (call) => {
    return getEncodedMethodParams(call);
};
const handleTypes = (call) => {
    if (call.params) {
        return getTypesArray(call.params);
    }
    return [];
};

// Create a function that checks if the param type last index of [ is greater than 0. If true - value is Param[][] else - value is Param[]
const isInstanceOfTupleArray = (value, param) => {
    return (param.customType ?? false) && param.type.lastIndexOf("[") > 0;
};
const isInstanceOfTuple = (value, param) => {
    return (param.customType ?? false) && param.type.lastIndexOf("[") === -1;
};

var helpers$3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    isInstanceOfTuple: isInstanceOfTuple,
    isInstanceOfTupleArray: isInstanceOfTupleArray
});

class EIP712StructTypes {
    transactionTypes = {};
    structTypes = {};
    static helpers = helpers$3;
    constructor(calls) {
        calls.forEach((call, index) => {
            const values = call.params
                ? call.params.map((param) => {
                    if (param.customType || param.type === "tuple") {
                        const type = this.getStructType(param, index);
                        return { name: param.name, type: param.type.lastIndexOf("[") > 0 ? `${type}[]` : type };
                    }
                    return {
                        name: param.name,
                        type: param.type,
                    };
                })
                : [];
            this.transactionTypes[`transaction${index + 1}`] = [{ name: "call", type: "Call" }, ...values];
        });
    }
    getTypeCount = () => Object.values(this.structTypes).length + 1;
    getStructType = (param, index) => {
        const typeName = `Struct${this.getTypeCount()}`;
        let paramValue;
        if (isInstanceOfTupleArray(param.value, param)) {
            paramValue = param.value[0];
        }
        else if (isInstanceOfTuple(param.value, param)) {
            paramValue = param.value;
        }
        else {
            throw new Error(`Invalid param value: ${param.value} for param: ${param.name}`);
        }
        let customCount = 0;
        const eip712Type = paramValue.map((item) => {
            if (item.customType || item.type.includes("tuple")) {
                ++customCount;
                const innerTypeName = `Struct${this.getTypeCount() + customCount}`;
                return {
                    name: item.name,
                    type: innerTypeName,
                };
            }
            return {
                name: item.name,
                type: item.type,
            };
        });
        this.structTypes[typeName] = eip712Type;
        if (param.type.lastIndexOf("[") > 0) {
            for (const parameter of param.value[0]) {
                if (parameter.customType || parameter.type.includes("tuple")) {
                    this.getStructType(parameter, index);
                }
            }
        }
        else {
            for (const parameter of param.value) {
                if (parameter.customType || parameter.type.includes("tuple")) {
                    this.getStructType(parameter, index);
                }
            }
        }
        return typeName;
    };
}

class FCTBase {
    FCT;
    constructor(FCT) {
        this.FCT = FCT;
    }
}

const EIP712Domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
    { name: "salt", type: "bytes32" },
];
const Meta = [
    { name: "name", type: "string" },
    { name: "builder", type: "address" },
    { name: "selector", type: "bytes4" },
    { name: "version", type: "bytes3" },
    { name: "random_id", type: "bytes3" },
    { name: "eip712", type: "bool" },
    { name: "auth_enabled", type: "bool" },
];
const Limits = [
    { name: "valid_from", type: "uint40" },
    { name: "expires_at", type: "uint40" },
    { name: "gas_price_limit", type: "uint64" },
    { name: "purgeable", type: "bool" },
    { name: "blockable", type: "bool" },
];
const Computed = [
    { name: "index", type: "uint256" },
    { name: "value", type: "uint256" },
    { name: "add", type: "uint256" },
    { name: "sub", type: "uint256" },
    { name: "pow", type: "uint256" },
    { name: "mul", type: "uint256" },
    { name: "div", type: "uint256" },
    { name: "mod", type: "uint256" },
];
const Call = [
    { name: "call_index", type: "uint16" },
    { name: "payer_index", type: "uint16" },
    { name: "call_type", type: "string" },
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "to_ens", type: "string" },
    { name: "eth_value", type: "uint256" },
    { name: "gas_limit", type: "uint32" },
    { name: "permissions", type: "uint16" },
    { name: "flow_control", type: "string" },
    { name: "returned_false_means_fail", type: "bool" },
    { name: "jump_on_success", type: "uint16" },
    { name: "jump_on_fail", type: "uint16" },
    { name: "method_interface", type: "string" },
];
const Recurrency = [
    { name: "max_repeats", type: "uint16" },
    { name: "chill_time", type: "uint32" },
    { name: "accumetable", type: "bool" },
];
const Multisig = [
    { name: "external_signers", type: "address[]" },
    { name: "minimum_approvals", type: "uint8" },
];

const getParams = (params) => {
    return {
        ...params.reduce((acc, param) => {
            let value;
            if (param.customType || param.type.includes("tuple")) {
                if (param.type.lastIndexOf("[") > 0) {
                    const valueArray = param.value;
                    value = valueArray.map((item) => getParams(item));
                }
                else {
                    const valueArray = param.value;
                    value = getParams(valueArray);
                }
            }
            else {
                value = param.value;
            }
            return {
                ...acc,
                [param.name]: value,
            };
        }, {}),
    };
};

const TYPED_DATA_DOMAIN = {
    "1": {
        // Mainnet
        name: "FCT Controller",
        version: "1",
        chainId: 1,
        verifyingContract: "0x0A0ea58E6504aA7bfFf6F3d069Bd175AbAb638ee",
        salt: "0x0100c3ae8d91c3ffd32800000a0ea58e6504aa7bfff6f3d069bd175abab638ee",
    },
    "5": {
        // Goerli
        name: "FCT Controller",
        version: "1",
        chainId: 5,
        verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
        salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
    },
    "42161": {
        // Arbitrum
        // TODO: Update this when the testnet is live
        name: "FCT Controller",
        version: "1",
        chainId: 42161,
        verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
        salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
    },
    "421613": {
        // Arbitrum Testnet
        // TODO: Update this when the testnet is live
        name: "FCT Controller",
        version: "1",
        chainId: 421613,
        verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
        salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
    },
};
const types = {
    domain: EIP712Domain,
    meta: Meta,
    limits: Limits,
    computed: Computed,
    call: Call,
    recurrency: Recurrency,
    multisig: Multisig,
};
class EIP712 extends FCTBase {
    constructor(FCT) {
        super(FCT);
    }
    static types = types;
    static getTypedDataDomain(chainId) {
        return TYPED_DATA_DOMAIN[chainId];
    }
    getTypedData() {
        return {
            types: this.getTypedDataTypes(),
            primaryType: this.getPrimaryType(),
            domain: this.getTypedDataDomain(),
            message: this.getTypedDataMessage(),
        };
    }
    getTypedDataMessage() {
        const transactionTypedData = this.getTransactionTypedDataMessage();
        const FCTOptions = this.FCT.options;
        const { recurrency, multisig } = FCTOptions;
        let optionalMessage = {};
        if (Number(recurrency.maxRepeats) > 1) {
            optionalMessage = _.merge(optionalMessage, {
                recurrency: {
                    max_repeats: recurrency.maxRepeats,
                    chill_time: recurrency.chillTime,
                    accumetable: recurrency.accumetable,
                },
            });
        }
        if (multisig.externalSigners.length > 0) {
            optionalMessage = _.merge(optionalMessage, {
                multisig: {
                    external_signers: multisig.externalSigners,
                    minimum_approvals: multisig.minimumApprovals || "2",
                },
            });
        }
        return {
            meta: {
                name: FCTOptions.name || "",
                builder: FCTOptions.builder || "0x0000000000000000000000000000000000000000",
                selector: this.FCT.batchMultiSigSelector,
                version: this.FCT.version,
                random_id: `0x${this.FCT.randomId}`,
                eip712: true,
                auth_enabled: FCTOptions.authEnabled,
            },
            limits: {
                valid_from: FCTOptions.validFrom,
                expires_at: FCTOptions.expiresAt,
                gas_price_limit: FCTOptions.maxGasPrice,
                purgeable: FCTOptions.purgeable,
                blockable: FCTOptions.blockable,
            },
            ...optionalMessage,
            ...getComputedVariableMessage(this.FCT.computedWithValues),
            ...transactionTypedData,
        };
    }
    getTypedDataTypes() {
        const { structTypes, transactionTypes } = new EIP712StructTypes(this.FCT.calls);
        const FCTOptions = this.FCT.options;
        const { recurrency, multisig } = FCTOptions;
        let optionalTypes = {};
        const additionalTypesInPrimary = [];
        if (Number(recurrency.maxRepeats) > 1) {
            optionalTypes = _.merge(optionalTypes, { Recurrency: EIP712.types.recurrency });
            additionalTypesInPrimary.push({ name: "recurrency", type: "Recurrency" });
        }
        if (multisig.externalSigners.length > 0) {
            optionalTypes = _.merge(optionalTypes, { Multisig: EIP712.types.multisig });
            additionalTypesInPrimary.push({ name: "multisig", type: "Multisig" });
        }
        if (this.FCT.computed.length > 0) {
            optionalTypes = _.merge(optionalTypes, { Computed: EIP712.types.computed });
        }
        return {
            EIP712Domain: EIP712.types.domain,
            Meta: EIP712.types.meta,
            Limits: EIP712.types.limits,
            ...optionalTypes,
            ...transactionTypes,
            ...structTypes,
            BatchMultiSigCall: this.getPrimaryTypeTypes(additionalTypesInPrimary),
            Call: EIP712.types.call,
        };
    }
    getTypedDataDomain() {
        return this.FCT.domain;
    }
    getPrimaryType() {
        return "BatchMultiSigCall";
    }
    getPrimaryTypeTypes(additionalTypes) {
        return [
            { name: "meta", type: "Meta" },
            { name: "limits", type: "Limits" },
            ...additionalTypes,
            ...this.getComputedPrimaryType(),
            ...this.getCallsPrimaryType(),
        ];
    }
    getCallsPrimaryType() {
        return this.FCT.calls.map((_, index) => ({
            name: `transaction_${index + 1}`,
            type: `transaction${index + 1}`,
        }));
    }
    getComputedPrimaryType() {
        return this.FCT.computed.map((_, index) => ({
            name: `computed_${index + 1}`,
            type: `Computed`,
        }));
    }
    getTransactionTypedDataMessage() {
        return this.FCT.decodedCalls.reduce((acc, call, index) => {
            const paramsData = call.params ? getParams(call.params) : {};
            const options = call.options || {};
            const gasLimit = options.gasLimit ?? "0";
            const flow = options.flow ? flows[options.flow].text : "continue on success, revert on fail";
            let jumpOnSuccess = 0;
            let jumpOnFail = 0;
            if (options.jumpOnSuccess && options.jumpOnSuccess !== NO_JUMP) {
                const jumpOnSuccessIndex = this.FCT.calls.findIndex((c) => c.nodeId === options.jumpOnSuccess);
                if (jumpOnSuccessIndex === -1) {
                    throw new Error(`Jump on success node id ${options.jumpOnSuccess} not found`);
                }
                if (jumpOnSuccessIndex <= index) {
                    throw new Error(`Jump on success node id ${options.jumpOnSuccess} is current or before current node (${call.nodeId})`);
                }
                jumpOnSuccess = jumpOnSuccessIndex - index - 1;
            }
            if (options.jumpOnFail && options.jumpOnFail !== NO_JUMP) {
                const jumpOnFailIndex = this.FCT.calls.findIndex((c) => c.nodeId === options.jumpOnFail);
                if (jumpOnFailIndex === -1) {
                    throw new Error(`Jump on fail node id ${options.jumpOnFail} not found`);
                }
                if (jumpOnFailIndex <= index) {
                    throw new Error(`Jump on fail node id ${options.jumpOnFail} is current or before current node (${call.nodeId})`);
                }
                jumpOnFail = jumpOnFailIndex - index - 1;
            }
            return {
                ...acc,
                [`transaction_${index + 1}`]: {
                    call: {
                        call_index: index + 1,
                        payer_index: call.options?.payerIndex,
                        call_type: call.options?.callType ? CALL_TYPE_MSG[call.options.callType] : CALL_TYPE_MSG.ACTION,
                        from: this.FCT.variables.getValue(call.from, "address"),
                        to: this.FCT.variables.getValue(call.to, "address"),
                        to_ens: call.toENS || "",
                        eth_value: this.FCT.variables.getValue(call.value, "uint256", "0"),
                        gas_limit: gasLimit,
                        permissions: 0,
                        flow_control: flow,
                        returned_false_means_fail: options.falseMeansFail || false,
                        jump_on_success: jumpOnSuccess,
                        jump_on_fail: jumpOnFail,
                        method_interface: handleMethodInterface(call),
                    },
                    ...paramsData,
                },
            };
        }, {});
    }
}

const isAddress$1 = ethers.utils.isAddress;
const mustBeInteger = ["validFrom", "expiresAt", "maxGasPrice", "maxRepeats", "chillTime", "minimumApprovals"];
const mustBeAddress = ["builder"];
// Validate Integer values in options
const validateInteger = (value, keys) => {
    const currentKey = keys[keys.length - 1];
    if (value.includes(".")) {
        throw new Error(`Options: ${keys.join(".")} cannot be a decimal`);
    }
    if (value.startsWith("-")) {
        throw new Error(`Options: ${keys.join(".")} cannot be negative`);
    }
    if (currentKey === "maxRepeats" && Number(value) < 0) {
        throw new Error(`Options: ${keys.join(".")} should be at least 0. If value is 0 or 1, recurrency will not be enabled in order to save gas`);
    }
};
// Validate address values in options
const validateAddress = (value, keys) => {
    if (!isAddress$1(value)) {
        throw new Error(`Options: ${keys.join(".")} is not a valid address`);
    }
};

var helpers$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    mustBeAddress: mustBeAddress,
    mustBeInteger: mustBeInteger,
    validateAddress: validateAddress,
    validateInteger: validateInteger
});

const initOptions = {
    maxGasPrice: "30000000000",
    validFrom: getDate(),
    expiresAt: getDate(7),
    purgeable: false,
    blockable: true,
    builder: "0x0000000000000000000000000000000000000000",
    authEnabled: true,
};
class Options {
    static helpers = helpers$2;
    _options = initOptions;
    set(options) {
        const mergedOptions = _.merge({}, this._options, options);
        Options.verify(mergedOptions);
        this._options = mergedOptions;
        return this._options;
    }
    get() {
        return {
            ...this._options,
            name: this._options.name || "",
            recurrency: {
                maxRepeats: this._options.recurrency?.maxRepeats || "0",
                chillTime: this._options.recurrency?.chillTime || "0",
                accumetable: this._options.recurrency?.accumetable || false,
            },
            multisig: {
                externalSigners: this._options.multisig?.externalSigners || [],
                minimumApprovals: this._options.multisig?.minimumApprovals || "0",
            },
        };
    }
    reset() {
        this._options = initOptions;
    }
    static verify(options) {
        this.validateOptionsValues(options);
    }
    static validateOptionsValues = (value, parentKeys = []) => {
        if (!value) {
            return;
        }
        Object.keys(value).forEach((key) => {
            const objKey = key;
            if (typeof value[objKey] === "object") {
                this.validateOptionsValues(value[objKey], [...parentKeys, objKey]);
            }
            // Integer validator
            if (mustBeInteger.includes(objKey)) {
                validateInteger(value[objKey], [...parentKeys, objKey]);
            }
            // Address validator
            if (mustBeAddress.includes(objKey)) {
                validateAddress(value[objKey], [...parentKeys, objKey]);
            }
            // Expires at validator
            if (objKey === "expiresAt") {
                const expiresAt = Number(value[objKey]);
                const now = Number(new Date().getTime() / 1000).toFixed();
                const validFrom = value.validFrom;
                if (BigInt(expiresAt) <= BigInt(now)) {
                    throw new Error(`Options: expiresAt must be in the future`);
                }
                if (validFrom && BigInt(expiresAt) <= BigInt(validFrom)) {
                    throw new Error(`Options: expiresAt must be greater than validFrom`);
                }
            }
        });
    };
    static fromObject(options) {
        const instance = new Options();
        instance.set(options);
        return instance;
    }
}

const sessionIdFlag = {
    accumetable: 0x1,
    purgeable: 0x2,
    blockable: 0x4,
    eip712: 0x8,
    authEnabled: 0x10,
};
const valueWithPadStart = (value, padStart) => {
    return Number(value).toString(16).padStart(padStart, "0");
};
// Deconstructed sessionID
// 6 - Salt
// 2 - External signers
// 6 - Version
// 4 - Max Repeats
// 8 - Chill time
// 10 - After timestamp
// 10 - Before timestamp
// 16 - Gas price limit
// 2 - Flags
class SessionID extends FCTBase {
    constructor(FCT) {
        super(FCT);
    }
    asString() {
        return SessionID.asString({
            salt: this.FCT.randomId,
            version: this.FCT.version,
            options: this.FCT.options,
        });
    }
    static asString({ salt, version, options }) {
        const currentDate = new Date();
        const { recurrency, multisig } = options;
        if (options.expiresAt && Number(options.expiresAt) < currentDate.getTime() / 1000) {
            throw new Error("Expires at date cannot be in the past");
        }
        const minimumApprovals = valueWithPadStart(multisig.minimumApprovals, 2);
        const v = version.slice(2);
        const maxRepeats = valueWithPadStart(recurrency.maxRepeats, 4);
        const chillTime = Number(Number(recurrency.maxRepeats) > 1 ? options.recurrency.chillTime : 0)
            .toString(16)
            .padStart(8, "0");
        const beforeTimestamp = valueWithPadStart(options.expiresAt || 0, 10);
        const afterTimestamp = valueWithPadStart(options.validFrom || 0, 10);
        const maxGasPrice = valueWithPadStart(options.maxGasPrice || 0, 16);
        let flagValue = 0;
        flagValue += sessionIdFlag.eip712; // EIP712 true by default
        if (options.recurrency?.accumetable)
            flagValue += sessionIdFlag.accumetable;
        if (options.purgeable)
            flagValue += sessionIdFlag.purgeable;
        if (options.blockable)
            flagValue += sessionIdFlag.blockable;
        if (options.authEnabled)
            flagValue += sessionIdFlag.authEnabled;
        const flags = flagValue.toString(16).padStart(2, "0");
        return `0x${salt}${minimumApprovals}${v}${maxRepeats}${chillTime}${beforeTimestamp}${afterTimestamp}${maxGasPrice}${flags}`;
    }
    static asOptions({ sessionId, builder, name, externalSigners = [], }) {
        const parsedSessionID = SessionID.parse(sessionId);
        return {
            ...parsedSessionID,
            builder,
            name,
            multisig: {
                ...parsedSessionID.multisig,
                externalSigners,
            },
        };
    }
    static parse(sessionId) {
        const minimumApprovals = parseInt(sessionId.slice(8, 10), 16).toString();
        const maxRepeats = parseInt(sessionId.slice(16, 20), 16).toString();
        const chillTime = parseInt(sessionId.slice(20, 28), 16).toString();
        const expiresAt = parseInt(sessionId.slice(28, 38), 16).toString();
        const validFrom = parseInt(sessionId.slice(38, 48), 16).toString();
        const maxGasPrice = parseInt(sessionId.slice(48, 64), 16).toString();
        const flagsNumber = parseInt(sessionId.slice(64, 66), 16);
        const flags = {
            eip712: (flagsNumber & sessionIdFlag.eip712) !== 0,
            accumetable: (flagsNumber & sessionIdFlag.accumetable) !== 0,
            purgeable: (flagsNumber & sessionIdFlag.purgeable) !== 0,
            blockable: (flagsNumber & sessionIdFlag.blockable) !== 0,
            authEnabled: (flagsNumber & sessionIdFlag.authEnabled) !== 0,
        };
        return {
            validFrom,
            expiresAt,
            maxGasPrice,
            blockable: flags.blockable,
            purgeable: flags.purgeable,
            authEnabled: flags.authEnabled,
            recurrency: {
                accumetable: flags.accumetable,
                chillTime,
                maxRepeats,
            },
            multisig: {
                minimumApprovals,
            },
        };
    }
}

const getUsedStructTypes = (typedData, typeName) => {
    const mainType = typedData.types[typeName.replace("[]", "")];
    return mainType.reduce((acc, item) => {
        if (item.type.includes("Struct")) {
            const type = item.type.replace("[]", "");
            return [...acc, type, ...getUsedStructTypes(typedData, type)];
        }
        return acc;
    }, []);
};

var helpers$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getUsedStructTypes: getUsedStructTypes
});

const { hexlify, id } = utils$1;
class ExportFCT extends FCTBase {
    calls;
    _eip712;
    constructor(FCT) {
        super(FCT);
        this.calls = FCT.decodedCalls;
        this._eip712 = new EIP712(FCT);
        if (this.FCT.calls.length === 0) {
            throw new Error("FCT has no calls");
        }
        Options.verify(this.FCT.options);
    }
    get typedData() {
        return this._eip712.getTypedData();
    }
    get mcall() {
        return this.getCalls();
    }
    get sessionId() {
        return new SessionID(this.FCT).asString();
    }
    get() {
        return {
            typedData: this.typedData,
            builder: this.FCT.options.builder,
            typeHash: hexlify(TypedDataUtils.hashType(this.typedData.primaryType, this.typedData.types)),
            sessionId: this.sessionId,
            nameHash: id(this.FCT.options.name),
            mcall: this.mcall,
            variables: [],
            externalSigners: this.FCT.options.multisig.externalSigners,
            signatures: [this.FCT.utils.getAuthenticatorSignature()],
            computed: this.FCT.computedWithValues.map((c) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { index, ...rest } = c;
                return rest;
            }),
        };
    }
    getCalls() {
        const typedData = this.typedData;
        const calls = this.calls;
        return calls.map((call, index) => {
            const usedTypeStructs = getUsedStructTypes(typedData, `transaction${index + 1}`);
            return {
                typeHash: hexlify(TypedDataUtils.hashType(`transaction${index + 1}`, typedData.types)),
                ensHash: id(call.toENS || ""),
                functionSignature: handleFunctionSignature(call),
                value: this.FCT.variables.getValue(call.value, "uint256", "0"),
                callId: CallID.asString({
                    calls,
                    call,
                    index,
                }),
                from: this.FCT.variables.getValue(call.from, "address"),
                to: this.FCT.variables.getValue(call.to, "address"),
                data: handleData(call),
                types: handleTypes(call),
                typedHashes: usedTypeStructs.length > 0
                    ? usedTypeStructs.map((hash) => hexlify(TypedDataUtils.hashType(hash, typedData.types)))
                    : [],
            };
        });
    }
    static helpers = helpers$1;
}

const ParamType = ethers.utils.ParamType;
const manageValue = (value) => {
    const variables = ["0xfb0", "0xfa0", "0xfc00000", "0xfd00000", "0xfdb000"];
    if (BigNumber.isBigNumber(value)) {
        const hexString = value.toHexString().toLowerCase();
        if (variables.some((v) => hexString.startsWith(v))) {
            value = hexString;
        }
        return value.toString();
    }
    if (typeof value === "number") {
        return value.toString();
    }
    return value;
};
const isInteger = (value, key) => {
    if (value.length === 0) {
        throw new Error(`${key} cannot be empty string`);
    }
    if (value.startsWith("-")) {
        throw new Error(`${key} cannot be negative`);
    }
    if (value.includes(".")) {
        throw new Error(`${key} cannot be a decimal`);
    }
};
const isAddress = (value, key) => {
    if (value.length === 0) {
        throw new Error(`${key} address cannot be empty string`);
    }
    if (!utils$1.isAddress(value)) {
        throw new Error(`${key} address is not a valid address`);
    }
};
const verifyParam = (param) => {
    if (!param.value) {
        throw new Error(`Param ${param.name} is missing a value`);
    }
    if (typeof param.value !== "string") {
        return;
    }
    // uint value
    if (param.type.startsWith("uint")) {
        if (param.value.includes(".")) {
            throw new Error(`Param ${param.name} cannot be a decimal`);
        }
        if (param.value.startsWith("-")) {
            throw new Error(`Param ${param.name} cannot be negative`);
        }
    }
    // int value
    if (param.type.startsWith("int")) {
        if (param.value.includes(".")) {
            throw new Error(`Param ${param.name} cannot be a decimal`);
        }
    }
    // address
    if (param.type === "address") {
        if (!utils$1.isAddress(param.value)) {
            throw new Error(`Param ${param.name} is not a valid address`);
        }
    }
    // bytes
    if (param.type.startsWith("bytes")) {
        if (!param.value.startsWith("0x")) {
            throw new Error(`Param ${param.name} is not a valid bytes value`);
        }
    }
};
const getParamsFromInputs = (inputs, values) => {
    return inputs.map((input, i) => {
        if (input.type === "tuple") {
            return {
                name: input.name,
                type: input.type,
                customType: true,
                value: getParamsFromInputs(input.components, values[i]),
            };
        }
        if (input.type === "tuple[]") {
            return {
                name: input.name,
                type: input.type,
                customType: true,
                value: values[i].map((tuple) => getParamsFromInputs(input.components, tuple)),
            };
        }
        let value = values[i];
        // Check if value isn't a variable
        value = manageValue(value);
        return {
            name: input.name,
            type: input.type,
            value,
        };
    });
};
const getParamsFromTypedData = ({ methodInterfaceParams, parameters, types, primaryType, }) => {
    const generateRealInputParams = (types, primaryType) => {
        let type = types[primaryType];
        // If the type[0] name is call and type is Call, then slice the first element
        if (type[0].name === "call" && type[0].type === "Call") {
            type = type.slice(1);
        }
        const params = [];
        for (const { name, type: paramType } of type) {
            // Remove [] from the end of the type
            const typeWithoutArray = paramType.replace(/\[\]$/, "");
            if (types[typeWithoutArray]) {
                const components = generateRealInputParams(types, typeWithoutArray);
                params.push(ParamType.from({ name, type: typeWithoutArray, components }));
            }
            else {
                params.push(ParamType.from({ name, type: paramType }));
            }
        }
        return params;
    };
    const getParams = (realInputParams, eip712InputTypes, parameters) => {
        return eip712InputTypes.map((input, i) => {
            const realInput = realInputParams[i];
            if (input.type === "tuple") {
                return {
                    name: realInput.name,
                    type: input.type,
                    customType: true,
                    value: getParams(realInput.components, input.components, parameters[realInput.name]),
                };
            }
            if (input.type === "tuple[]") {
                return {
                    name: realInput.name,
                    type: input.type,
                    customType: true,
                    value: parameters[realInput.name].map((tuple) => getParams(realInput.components, input.components, tuple)),
                };
            }
            let value = parameters[realInput.name];
            // Check if value isn't a variable
            value = manageValue(value);
            return {
                name: realInput.name,
                type: realInput.type,
                customType: false,
                // If realInputType.type is a string and eip712InputType.type is bytes32, value is hashed
                hashed: input.type === "bytes32" && realInput.type === "string",
                value,
            };
        });
    };
    const realInputParams = generateRealInputParams(types, primaryType);
    return getParams(realInputParams, methodInterfaceParams, parameters);
};

var helpers = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getParamsFromInputs: getParamsFromInputs,
    getParamsFromTypedData: getParamsFromTypedData,
    isAddress: isAddress,
    isInteger: isInteger,
    verifyParam: verifyParam
});

function generateNodeId() {
    return [...Array(20)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}
function instanceOfCallWithPlugin(object) {
    return typeof object === "object" && "plugin" in object;
}
function instanceOfCallWithEncodedData(object) {
    return typeof object === "object" && "abi" in object;
}
class FCTCalls extends FCTBase {
    static helpers = helpers;
    _calls = [];
    _callDefault = {
        value: "0",
        options: DEFAULT_CALL_OPTIONS,
    };
    constructor(FCT, callDefault) {
        super(FCT);
        if (callDefault) {
            this._callDefault = _.merge({}, this._callDefault, callDefault);
        }
    }
    getCallDefaults() {
        return this._callDefault;
    }
    get() {
        return this._calls.map((call, index) => {
            const fullCall = _.merge({}, this.getSpecificCallDefaults(index), call);
            if (typeof fullCall.from === "undefined") {
                throw new Error("From address is required");
            }
            const from = fullCall.from;
            return {
                ...fullCall,
                from,
            };
        });
    }
    getWithDecodedVariables() {
        return this.get().map((call) => {
            const params = call.params;
            if (params && params.length > 0) {
                const parameters = this.decodeParams(params);
                return { ...call, params: parameters };
            }
            return {
                ...call,
                params: [],
            };
        });
    }
    async create(call) {
        if (instanceOfCallWithPlugin(call)) {
            return (await this.createWithPlugin(call));
        }
        else if (instanceOfCallWithEncodedData(call)) {
            return this.createWithEncodedData(call);
        }
        else {
            return this.createSimpleCall(call);
        }
    }
    async createWithPlugin(callWithPlugin) {
        if (!callWithPlugin.plugin) {
            throw new Error("Plugin is required to create a call with plugin.");
        }
        const pluginCall = await callWithPlugin.plugin.create();
        if (!pluginCall) {
            throw new Error("Error creating call with plugin. Make sure input values are valid");
        }
        const data = {
            ...pluginCall,
            from: callWithPlugin.from,
            options: { ...pluginCall.options, ...callWithPlugin.options },
            nodeId: callWithPlugin.nodeId || generateNodeId(),
        };
        return this.addCall(data);
    }
    createWithEncodedData(callWithEncodedData) {
        const { value, encodedData, abi, options, nodeId } = callWithEncodedData;
        const iface = new utils$1.Interface(abi);
        try {
            const { name, args, functionFragment: { inputs }, } = iface.parseTransaction({
                data: encodedData,
                value: typeof value === "string" ? value : "0",
            });
            const data = {
                from: callWithEncodedData.from,
                to: callWithEncodedData.to,
                method: name,
                params: getParamsFromInputs(inputs, args),
                options,
                value: value?.toString(),
                nodeId: nodeId || generateNodeId(),
            };
            return this.addCall(data);
        }
        catch {
            throw new Error("Failed to parse encoded data");
        }
    }
    createSimpleCall(call) {
        const data = _.merge({}, call, { nodeId: call.nodeId || generateNodeId() });
        return this.addCall(data);
    }
    setCallDefaults(callDefault) {
        this._callDefault = _.merge({}, this._callDefault, callDefault);
        return this._callDefault;
    }
    addCall(call) {
        // Before adding the call, we check if it is valid
        this.verifyCall(call);
        this._calls.push(call);
        return call;
    }
    verifyCall(call) {
        // To address validator
        if (!call.to) {
            throw new Error("To address is required");
        }
        else if (typeof call.to === "string") {
            isAddress(call.to, "To");
        }
        // Value validator
        if (call.value && typeof call.value === "string") {
            isInteger(call.value, "Value");
        }
        // Method validator
        if (call.method && call.method.length === 0) {
            throw new Error("Method cannot be empty string");
        }
        // Node ID validator
        if (call.nodeId) {
            const index = this.get().findIndex((item) => item.nodeId === call.nodeId);
            if (index > -1) {
                throw new Error(`Node ID ${call.nodeId} already exists, please use a different one`);
            }
        }
        // Options validator
        if (call.options) {
            const { gasLimit, callType } = call.options;
            if (gasLimit) {
                isInteger(gasLimit, "Gas limit");
            }
            if (callType) {
                const keysOfCALLTYPE = Object.keys(CALL_TYPE);
                if (!keysOfCALLTYPE.includes(callType)) {
                    throw new Error(`Call type ${callType} is not valid`);
                }
            }
        }
        if (call.params && call.params.length) {
            if (!call.method) {
                throw new Error("Method is required when params are present");
            }
            call.params.map(verifyParam);
        }
    }
    decodeParams(params) {
        return params.reduce((acc, param) => {
            if (param.type === "tuple" || param.customType) {
                if (param.type.lastIndexOf("[") > 0) {
                    const value = param.value;
                    const decodedValue = value.map((tuple) => this.decodeParams(tuple));
                    return [...acc, { ...param, value: decodedValue }];
                }
                const value = this.decodeParams(param.value);
                return [...acc, { ...param, value }];
            }
            if (instanceOfVariable(param.value)) {
                const value = this.FCT.variables.getVariable(param.value, param.type);
                const updatedParam = { ...param, value };
                return [...acc, updatedParam];
            }
            return [...acc, param];
        }, []);
    }
    getSpecificCallDefaults = (index) => {
        const optionsPayerIndex = this._callDefault.options.payerIndex;
        const payerIndex = optionsPayerIndex !== undefined ? optionsPayerIndex : index + 1;
        return {
            ...this._callDefault,
            options: {
                ...this._callDefault.options,
                payerIndex,
            },
        };
    };
}

function getCalldataForActuator({ signedFCT, purgedFCT, investor, activator, version, }) {
    return Interfaces.FCT_BatchMultiSigCall.encodeFunctionData("batchMultiSigCall", [
        `0x${version}`.padEnd(66, "0"),
        signedFCT,
        purgedFCT,
        investor,
        activator,
    ]);
}

function isValidNotification(fct) {
    const FCT = BatchMultiSigCall.from(fct);
    const calls = FCT.calls;
    for (const call of calls) {
        if (call.options.payerIndex !== 0) {
            throw new Error(`payerIndex must be 0 for notification`);
        }
        if (call.options.callType !== "VIEW_ONLY") {
            throw new Error(`callType must be view only for notification`);
        }
    }
    return true;
}

const splitSignature = ethers.utils.splitSignature;
const AUTHENTICATOR_PRIVATE_KEY = "5c35caeef2837c989ca02120f70b439b1f3266b779db6eb38ccabba24a2522b3";
const getAuthenticatorSignature = (typedData) => {
    try {
        const signature = signTypedData({
            data: typedData,
            privateKey: Buffer.from(AUTHENTICATOR_PRIVATE_KEY, "hex"),
            version: SignTypedDataVersion.V4,
        });
        return splitSignature(signature);
    }
    catch {
        console.log(util.inspect(typedData, false, null, true /* enable colors */));
        return { r: "0x", s: "0x", v: 0 };
    }
};

var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getAuthenticatorSignature: getAuthenticatorSignature,
    getCalldataForActuator: getCalldataForActuator,
    isValidNotification: isValidNotification
});

const { getAddress } = utils$1;
function getAllRequiredApprovals(FCT) {
    let requiredApprovals = [];
    if (!FCT.chainId) {
        throw new Error("No chainId or provider has been set");
    }
    const chainId = FCT.chainId;
    for (const [callIndex, call] of FCT.calls.entries()) {
        if (typeof call.to !== "string") {
            continue;
        }
        const pluginData = getPlugin$1({
            signature: handleFunctionSignature(call),
            address: call.to,
            chainId,
        });
        if (pluginData) {
            const initPlugin = new pluginData.plugin({
                chainId,
                vaultAddress: typeof call.from === "string" ? call.from : "",
            });
            const methodParams = call.params
                ? call.params.reduce((acc, param) => {
                    acc[param.name] = param.value;
                    return acc;
                }, {})
                : {};
            initPlugin.input.set({
                to: call.to,
                methodParams,
            });
            const approvals = initPlugin.getRequiredApprovals();
            if (approvals.length > 0 && typeof call.from === "string") {
                const manageValue = (value) => {
                    if (instanceOfVariable(value) || !value) {
                        return "";
                    }
                    return value;
                };
                const requiredApprovalsWithFrom = approvals
                    .map((approval) => {
                    if (approval.method === "approve") {
                        const data = {
                            token: manageValue(approval.to),
                            method: approval.method,
                            from: manageValue(approval.from || call.from),
                        };
                        if (approval.protocol === "ERC20") {
                            return {
                                ...data,
                                protocol: approval.protocol,
                                params: {
                                    spender: manageValue(approval.params[0]),
                                    amount: approval.params[1],
                                },
                            };
                        }
                        else if (approval.protocol === "ERC721") {
                            return {
                                ...data,
                                protocol: approval.protocol,
                                params: {
                                    spender: manageValue(approval.params[0]),
                                    tokenId: approval.params[1],
                                },
                            };
                        }
                    }
                    if (approval.method === "setApprovalForAll" &&
                        (approval.protocol === "ERC721" || approval.protocol === "ERC1155")) {
                        return {
                            protocol: approval.protocol,
                            token: manageValue(approval.to),
                            method: approval.method,
                            params: {
                                spender: manageValue(approval.params[0]),
                                approved: approval.params[1],
                            },
                            from: manageValue(approval.from || call.from), // Who needs to approve
                        };
                    }
                    if (approval.protocol === "AAVE" && approval.method === "approveDelegation") {
                        return {
                            protocol: approval.protocol,
                            token: manageValue(approval.to),
                            method: approval.method,
                            params: {
                                delegatee: manageValue(approval.params[0]),
                                amount: approval.params[1],
                            },
                            from: manageValue(approval.from || call.from), // Who needs to approve
                        };
                    }
                    throw new Error("Unknown method for plugin");
                })
                    .filter((approval) => {
                    if (typeof call.from !== "string") {
                        return true;
                    }
                    const isGoingToGetApproved = FCT.calls.some((fctCall, i) => {
                        if (i >= callIndex)
                            return false; // If the call is after the current call, we don't need to check
                        const { to, method, from } = fctCall;
                        if (typeof to !== "string" || typeof from !== "string")
                            return false; // If the call doesn't have a to or from, we don't need to check
                        // Check if there is the same call inside FCT and BEFORE this call. If there is, we don't need to approve again
                        return (to.toLowerCase() === approval.token.toLowerCase() &&
                            method === approval.method &&
                            from.toLowerCase() === approval.from.toLowerCase());
                    });
                    if (isGoingToGetApproved)
                        return false;
                    const caller = getAddress(call.from);
                    // If the protocol is AAVE, we check if the caller is the spender and the approver
                    if (approval.protocol === "AAVE") {
                        const whoIsApproving = getAddress(approval.from);
                        const whoIsSpending = getAddress(approval.params.delegatee);
                        // If the caller is the spender and the approver - no need to approve
                        return !(caller === whoIsSpending && caller === whoIsApproving);
                    }
                    // If the protocol is ERC721 and the call method is safeTransferFrom or transferFrom
                    if (approval.protocol === "ERC721" &&
                        (call.method === "safeTransferFrom" || call.method === "transferFrom")) {
                        const whoIsSending = getAddress(approval.from);
                        const whoIsSpending = getAddress(approval.params.spender);
                        // If the caller and spender is the same, no need to approve
                        return !(whoIsSending === whoIsSpending);
                    }
                    return true;
                });
                requiredApprovals = [...requiredApprovals, ...requiredApprovalsWithFrom];
            }
        }
    }
    return requiredApprovals;
}

const WHOLE_IN_BPS = 10000n;
const fees = {
    beforeCallingBatchMultiSigCall: 5000n,
    FCTControllerOverhead: 43000n,
    gasBeforeEncodedLoop: 3000n,
    gasForEncodingCall: 8000n,
    additionalGasForEncodingCall: 100n,
    FCTControllerRegisterCall: 43000n,
    signatureRecovery: 6000n,
    miscGasBeforeMcallLoop: 1700n,
    mcallOverheadFirstCall: 34000n,
    mcallOverheadOtherCalls: 6250n,
    paymentApproval: 9000n,
    paymentsOutBase: 24500n,
    paymentsOutPerPayment: 1300n,
    totalCallsChecker: 16000n,
    estimateExtraCommmonGasCost: 4000n,
};
const getEncodingMcallCost = (callCount) => {
    return (BigInt(callCount) * fees.gasForEncodingCall +
        (BigInt(callCount) * BigInt(callCount - 1) * fees.additionalGasForEncodingCall) / 2n);
};
const getSignatureRecoveryCost = (signatureCount) => {
    return BigInt(signatureCount) * fees.signatureRecovery;
};
const getPaymentsOutCost = (callCount) => {
    return fees.paymentsOutBase + BigInt(callCount) * fees.paymentsOutPerPayment;
};
const getExtraCommonGas = (payersCount, msgDataLength) => {
    return 23100n + 4600n * BigInt(payersCount) + (77600n * BigInt(msgDataLength)) / 10000n;
};
const getPayers = (calls, pathIndexes) => {
    return pathIndexes.reduce((acc, pathIndex) => {
        const call = calls[Number(pathIndex)];
        const { payerIndex } = CallID.parse(call.callId);
        const payer = payerIndex === 0 ? undefined : calls[payerIndex - 1].from;
        // If payer !== undefined AND payer !== lastPayer, add it to the array
        if (payer && payer !== acc[acc.length - 1]) {
            acc.push(payer);
        }
        return acc;
    }, []);
};
const getAllSenders = (calls) => {
    return calls.reduce((acc, call) => {
        // If call.from is already in the array, don't add it
        if (!acc.includes(call.from)) {
            acc.push(call.from);
        }
        return acc;
    }, []);
};
function getPayersForRoute({ calls, pathIndexes, calldata, }) {
    const payers = getPayers(calls, pathIndexes);
    const allSenders = getAllSenders(calls);
    const batchMultiSigCallOverhead = fees.FCTControllerOverhead +
        fees.gasBeforeEncodedLoop +
        getEncodingMcallCost(calls.length) +
        fees.FCTControllerRegisterCall +
        getSignatureRecoveryCost(allSenders.length + 1) + // +1 because verification signature
        fees.miscGasBeforeMcallLoop;
    const overhead = fees.beforeCallingBatchMultiSigCall +
        batchMultiSigCallOverhead +
        getPaymentsOutCost(calls.length) +
        fees.totalCallsChecker +
        fees.estimateExtraCommmonGasCost;
    const commonGas = getExtraCommonGas(payers.length, calldata.length) + overhead;
    const commonGasPerCall = commonGas / BigInt(payers.length);
    const gasForFCTCall = pathIndexes.reduce((acc, path, index) => {
        const call = calls[Number(path)];
        const { payerIndex, options } = CallID.parse(call.callId);
        const payer = calls[payerIndex - 1].from;
        const overhead = index === 0 ? fees.mcallOverheadFirstCall : fees.mcallOverheadOtherCalls;
        const gas = BigInt(options.gasLimit) || 50000n;
        const amount = gas + overhead + commonGasPerCall;
        if (acc[payer]) {
            acc[payer] += amount;
        }
        else {
            acc[payer] = amount;
        }
        return acc;
    }, {});
    const gasForPaymentApprovals = payers.reduce((acc, address) => {
        if (acc[address]) {
            acc[address] += fees.paymentApproval;
        }
        else {
            acc[address] = fees.paymentApproval;
        }
        return acc;
    }, {});
    return allSenders.map((payer) => {
        const gas = gasForFCTCall[payer] + gasForPaymentApprovals[payer];
        return {
            payer,
            gas: gas || 0n,
        };
    });
}
function getEffectiveGasPrice({ maxGasPrice, gasPrice, baseFeeBPS, bonusFeeBPS, }) {
    return ((BigInt(gasPrice) * WHOLE_IN_BPS + baseFeeBPS + (BigInt(maxGasPrice) - BigInt(gasPrice)) * bonusFeeBPS) /
        WHOLE_IN_BPS).toString();
}

class FCTUtils extends FCTBase {
    _eip712;
    constructor(FCT) {
        super(FCT);
        this._eip712 = new EIP712(FCT);
    }
    get FCTData() {
        return this.FCT.exportFCT();
    }
    async getAllRequiredApprovals() {
        return getAllRequiredApprovals(this.FCT);
    }
    getCalldataForActuator({ signatures, purgedFCT, investor, activator, }) {
        return getCalldataForActuator({
            signedFCT: _.merge({}, this.FCTData, { signatures }),
            purgedFCT,
            investor,
            activator,
            version: this.FCT.version.slice(2),
        });
    }
    getAuthenticatorSignature() {
        return getAuthenticatorSignature(this._eip712.getTypedData());
    }
    recoverAddress(signature) {
        try {
            const signatureString = utils$1.joinSignature(signature);
            return recoverTypedSignature({
                data: this.FCTData.typedData,
                version: SignTypedDataVersion.V4,
                signature: signatureString,
            });
        }
        catch (e) {
            return null;
        }
    }
    getOptions() {
        const parsedSessionID = SessionID.asOptions({
            builder: this.FCTData.builder,
            sessionId: this.FCTData.sessionId,
            name: "",
        });
        return {
            valid_from: parsedSessionID.validFrom,
            expires_at: parsedSessionID.expiresAt,
            gas_price_limit: parsedSessionID.maxGasPrice,
            blockable: parsedSessionID.blockable,
            purgeable: parsedSessionID.purgeable,
            builder: parsedSessionID.builder,
            recurrency: parsedSessionID.recurrency,
            multisig: parsedSessionID.multisig,
            authEnabled: parsedSessionID.authEnabled,
        };
    }
    getMessageHash() {
        return ethers.utils.hexlify(TypedDataUtils.eip712Hash(this.FCTData.typedData, SignTypedDataVersion.V4));
    }
    isValid(softValidation = false) {
        const keys = Object.keys(this.FCTData);
        this.validateFCTKeys(keys);
        const limits = this.FCTData.typedData.message.limits;
        const fctData = this.FCTData.typedData.message.meta;
        const currentDate = new Date().getTime() / 1000;
        const validFrom = parseInt(limits.valid_from);
        const expiresAt = parseInt(limits.expires_at);
        const gasPriceLimit = limits.gas_price_limit;
        if (!softValidation && validFrom > currentDate) {
            throw new Error(`FCT is not valid yet. FCT is valid from ${validFrom}`);
        }
        if (expiresAt < currentDate) {
            throw new Error(`FCT has expired. FCT expired at ${expiresAt}`);
        }
        if (gasPriceLimit === "0") {
            throw new Error(`FCT gas price limit cannot be 0`);
        }
        if (!fctData.eip712) {
            throw new Error(`FCT must be type EIP712`);
        }
        return true;
    }
    // public isValidNotification(): boolean | Error {
    //   // Check every call, that callId.payerIndex is 0 after decoding
    //   const calls = this.FCT.calls;
    //   for (const call of calls) {
    //     if (call.options.payerIndex !== 0) {
    //       throw new Error(`CallID.payerIndex must be 0 for notification`);
    //     }
    //   }
    //
    //   return true;
    // }
    getSigners() {
        return this.FCTData.mcall.reduce((acc, { from }) => {
            if (!acc.includes(from)) {
                acc.push(from);
            }
            return acc;
        }, []);
    }
    getAllPaths() {
        const FCT = this.FCTData;
        const g = new Graph({ directed: true });
        FCT.mcall.forEach((_, index) => {
            g.setNode(index.toString());
        });
        for (let i = 0; i < FCT.mcall.length - 1; i++) {
            const callID = CallID.parseWithNumbers(FCT.mcall[i].callId);
            const jumpOnSuccess = callID.options.jumpOnSuccess;
            const jumpOnFail = callID.options.jumpOnFail;
            if (jumpOnSuccess === jumpOnFail) {
                g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
            }
            else {
                g.setEdge(i.toString(), (i + 1 + Number(jumpOnSuccess)).toString());
                g.setEdge(i.toString(), (i + 1 + Number(jumpOnFail)).toString());
            }
        }
        const allPaths = [];
        // const isVisited: Record<string, boolean> = {};
        const pathList = [];
        const start = "0";
        const end = (FCT.mcall.length - 1).toString();
        pathList.push(start);
        const printAllPathsUtil = (g, start, end, localPathList) => {
            if (start === end) {
                const path = localPathList.slice();
                allPaths.push(path);
                return;
            }
            let successors = g.successors(start);
            if (successors === undefined) {
                successors = [];
            }
            for (const id of successors) {
                localPathList.push(id);
                printAllPathsUtil(g, id, end, localPathList);
                localPathList.splice(localPathList.indexOf(id), 1);
            }
        };
        // printAllPathsUtil(g, start, end, isVisited, pathList);
        printAllPathsUtil(g, start, end, pathList);
        return allPaths;
    }
    // TODO: Make this function deprecated. Use getPaymentPerPayer instead
    getKIROPayment = ({ priceOfETHInKiro, gasPrice, gas, }) => {
        const fct = this.FCTData;
        const vault = fct.typedData.message["transaction_1"].call.from;
        const gasInt = BigInt(gas);
        const gasPriceFormatted = BigInt(gasPrice);
        const limits = fct.typedData.message.limits;
        const maxGasPrice = limits.gas_price_limit;
        // 1000 - baseFee
        // 5000 - bonusFee
        const effectiveGasPrice = (gasPriceFormatted * BigInt(10000 + 1000) + (BigInt(maxGasPrice) - gasPriceFormatted) * BigInt(5000)) /
            BigInt(10000);
        const feeGasCost = gasInt * (effectiveGasPrice - gasPriceFormatted);
        const baseGasCost = gasInt * gasPriceFormatted;
        const totalCost = baseGasCost + feeGasCost;
        const normalisedPriceOfETHInKiro = BigInt(priceOfETHInKiro);
        const kiroCost = (totalCost * normalisedPriceOfETHInKiro) / BigInt(1e18);
        return {
            vault,
            amountInKIRO: kiroCost.toString(),
            amountInETH: totalCost.toString(),
        };
    };
    kiroPerPayerGas = ({ gas, gasPrice, penalty, ethPriceInKIRO, fees, }) => {
        const baseFeeBPS = fees?.baseFeeBPS ? BigInt(fees.baseFeeBPS) : 1000n;
        const bonusFeeBPS = fees?.bonusFeeBPS ? BigInt(fees.bonusFeeBPS) : 5000n;
        const gasBigInt = BigInt(gas);
        const limits = this.FCTData.typedData.message.limits;
        const maxGasPrice = BigInt(limits.gas_price_limit);
        const gasPriceBigInt = BigInt(gasPrice) > maxGasPrice ? maxGasPrice : BigInt(gasPrice);
        const effectiveGasPrice = BigInt(getEffectiveGasPrice({
            gasPrice: gasPriceBigInt,
            maxGasPrice,
            baseFeeBPS,
            bonusFeeBPS,
        }));
        const base = gasBigInt * gasPriceBigInt;
        const fee = gasBigInt * (effectiveGasPrice - gasPriceBigInt);
        const ethCost = base + fee;
        const kiroCost = (ethCost * BigInt(ethPriceInKIRO)) / 10n ** 18n;
        return {
            ethCost: ((ethCost * BigInt(penalty || 10_000)) / 10000n).toString(),
            kiroCost: kiroCost.toString(),
        };
    };
    getPaymentPerPayer = ({ signatures, gasPrice, maxGasPrice, ethPriceInKIRO, penalty, fees, }) => {
        const baseFeeBPS = fees?.baseFeeBPS ? BigInt(fees.baseFeeBPS) : 1000n;
        const bonusFeeBPS = fees?.bonusFeeBPS ? BigInt(fees.bonusFeeBPS) : 5000n;
        const fct = this.FCTData;
        const allPaths = this.getAllPaths();
        const limits = fct.typedData.message.limits;
        maxGasPrice = maxGasPrice ? BigInt(maxGasPrice) : BigInt(limits.gas_price_limit);
        const txGasPrice = gasPrice ? BigInt(gasPrice) : maxGasPrice;
        const effectiveGasPrice = BigInt(getEffectiveGasPrice({
            gasPrice: txGasPrice,
            maxGasPrice,
            baseFeeBPS,
            bonusFeeBPS,
        }));
        fct.signatures = signatures || [];
        const calldata = this.getCalldataForActuator({
            activator: "0x0000000000000000000000000000000000000000",
            investor: "0x0000000000000000000000000000000000000000",
            purgedFCT: "0x".padEnd(66, "0"),
            signatures: fct.signatures,
        });
        const data = allPaths.map((path) => {
            const payers = getPayersForRoute({
                calldata,
                calls: fct.mcall,
                pathIndexes: path,
            });
            return payers.reduce((acc, payer) => {
                const base = payer.gas * txGasPrice;
                const fee = payer.gas * (effectiveGasPrice - txGasPrice);
                const ethCost = base + fee;
                const kiroCost = (ethCost * BigInt(ethPriceInKIRO)) / 10n ** 18n;
                return {
                    ...acc,
                    [payer.payer]: {
                        ...payer,
                        ethCost: (ethCost * BigInt(penalty || 10_000)) / 10000n,
                        kiroCost,
                    },
                };
            }, {});
        });
        const allPayers = [
            ...new Set(fct.mcall.map((call) => {
                const { payerIndex } = CallID.parse(call.callId);
                if (payerIndex === 0)
                    return ethers.constants.AddressZero;
                return fct.mcall[payerIndex - 1].from;
            })),
        ];
        return allPayers.map((payer) => {
            const { largest, smallest } = data.reduce((acc, pathData) => {
                const currentValues = acc;
                const currentLargestValue = currentValues.largest?.ethCost || 0n;
                const currentSmallestValue = currentValues.smallest?.ethCost;
                const value = pathData[payer]?.ethCost || 0n;
                if (value > currentLargestValue) {
                    currentValues.largest = pathData[payer];
                }
                if (!currentSmallestValue || value < currentSmallestValue) {
                    currentValues.smallest = pathData[payer];
                }
                return currentValues;
            }, {});
            return {
                payer,
                largestPayment: {
                    gas: largest.gas.toString(),
                    amount: largest.kiroCost.toString(),
                    amountInETH: largest.ethCost.toString(),
                },
                smallestPayment: {
                    gas: smallest.gas.toString(),
                    amount: smallest.kiroCost.toString(),
                    amountInETH: smallest.ethCost.toString(),
                },
            };
        });
    };
    getMaxGas = () => {
        const allPayers = this.getPaymentPerPayer({ ethPriceInKIRO: "0" });
        return allPayers.reduce((acc, payer) => {
            const largestGas = payer.largestPayment.gas;
            if (BigInt(largestGas) > BigInt(acc)) {
                return largestGas;
            }
            return acc;
        }, "0");
    };
    getCallResults = async ({ rpcUrl, provider, txHash, }) => {
        if (!provider && !rpcUrl) {
            throw new Error("Either provider or rpcUrl is required");
        }
        if (!provider) {
            provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        }
        const txReceipt = await provider.getTransactionReceipt(txHash);
        const batchMultiSigInterface = Interfaces.FCT_BatchMultiSigCall;
        const controllerInterface = Interfaces.FCT_Controller;
        // Get FCTE_Activated event
        const messageHash = txReceipt.logs.find((log) => {
            try {
                return controllerInterface.parseLog(log).name === "FCTE_Registered";
            }
            catch (e) {
                return false;
            }
        })?.topics[2];
        const messageHashUtil = this.getMessageHash();
        if (messageHash !== messageHashUtil) {
            throw new Error("Message hash mismatch");
        }
        const mapLog = (log) => {
            const parsedLog = batchMultiSigInterface.parseLog(log);
            return {
                id: parsedLog.args.id,
                caller: parsedLog.args.caller,
                callIndex: parsedLog.args.callIndex.toString(),
            };
        };
        const successCalls = txReceipt.logs
            .filter((log) => {
            try {
                return batchMultiSigInterface.parseLog(log).name === "FCTE_CallSucceed";
            }
            catch (e) {
                return false;
            }
        })
            .map(mapLog);
        const failedCalls = txReceipt.logs
            .filter((log) => {
            try {
                return batchMultiSigInterface.parseLog(log).name === "FCTE_CallFailed";
            }
            catch (e) {
                return false;
            }
        })
            .map(mapLog);
        const callResultConstants = {
            success: "SUCCESS",
            failed: "FAILED",
            skipped: "SKIPPED",
        };
        const manageResult = (index) => {
            if (successCalls.find((successCall) => successCall.callIndex === index))
                return callResultConstants.success;
            if (failedCalls.find((failedCall) => failedCall.callIndex === index))
                return callResultConstants.failed;
            return callResultConstants.skipped;
        };
        return this.FCT.calls.map((_, index) => {
            const indexString = (index + 1).toString();
            return {
                index: indexString,
                result: manageResult(indexString),
            };
        });
    };
    validateFCTKeys(keys) {
        const validKeys = [
            "typeHash",
            "typedData",
            "sessionId",
            "nameHash",
            "mcall",
            "builder",
            "variables",
            "externalSigners",
            "computed",
            "signatures",
        ];
        validKeys.forEach((key) => {
            if (!keys.includes(key)) {
                throw new Error(`FCT missing key ${key}`);
            }
        });
    }
}

const BLOCK_NUMBER = "0xFB0A000000000000000000000000000000000000";
const BLOCK_TIMESTAMP = "0xFB0B000000000000000000000000000000000000";
const GAS_PRICE = "0xFB0C000000000000000000000000000000000000";
const MINER_ADDRESS = "0xFA0A000000000000000000000000000000000000";
const ORIGIN_ADDRESS = "0xFA0B000000000000000000000000000000000000";
const INVESTOR_ADDRESS = "0xFA0C000000000000000000000000000000000000";
const ACTIVATOR_ADDRESS = "0xFA0D000000000000000000000000000000000000";
const ENGINE_ADDRESS = "0xFA0E000000000000000000000000000000000000";
// const BLOCK_HASH = "0xFF00000000000000000000000000000000000000";
const globalVariables = {
    blockNumber: BLOCK_NUMBER,
    blockTimestamp: BLOCK_TIMESTAMP,
    gasPrice: GAS_PRICE,
    minerAddress: MINER_ADDRESS,
    originAddress: ORIGIN_ADDRESS,
    investorAddress: INVESTOR_ADDRESS,
    activatorAddress: ACTIVATOR_ADDRESS,
    engineAddress: ENGINE_ADDRESS,
};
const getBlockNumber = () => ({ type: "global", id: "blockNumber" });
const getBlockTimestamp = () => ({ type: "global", id: "blockTimestamp" });
const getGasPrice = () => ({ type: "global", id: "gasPrice" });
const getMinerAddress = () => ({ type: "global", id: "minerAddress" });
const getOriginAddress = () => ({ type: "global", id: "originAddress" });
const getInvestorAddress = () => ({ type: "global", id: "investorAddress" });
const getActivatorAddress = () => ({ type: "global", id: "activatorAddress" });
const getEngineAddress = () => ({ type: "global", id: "engineAddress" });

var index$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getActivatorAddress: getActivatorAddress,
    getBlockNumber: getBlockNumber,
    getBlockTimestamp: getBlockTimestamp,
    getEngineAddress: getEngineAddress,
    getGasPrice: getGasPrice,
    getInvestorAddress: getInvestorAddress,
    getMinerAddress: getMinerAddress,
    getOriginAddress: getOriginAddress,
    globalVariables: globalVariables
});

class Variables extends FCTBase {
    _computed = [];
    constructor(FCT) {
        super(FCT);
    }
    get computed() {
        return this._computed;
    }
    get computedWithValues() {
        const handleVariable = (value) => {
            if (instanceOfVariable(value)) {
                return this.getVariable(value, "uint256");
            }
            return value;
        };
        return this._computed.map((c, i) => ({
            index: (i + 1).toString(),
            value: handleVariable(c.value),
            add: handleVariable(c.add),
            sub: handleVariable(c.sub),
            mul: handleVariable(c.mul),
            pow: handleVariable(c.pow),
            div: handleVariable(c.div),
            mod: handleVariable(c.mod),
        }));
    }
    addComputed(computed) {
        // Add the computed value to the batch call.
        const data = {
            id: computed.id || this._computed.length.toString(),
            value: computed.value,
            add: computed.add || "0",
            sub: computed.sub || "0",
            mul: computed.mul || "1",
            pow: computed.pow || "1",
            div: computed.div || "1",
            mod: computed.mod || "0",
        };
        this._computed.push(data);
        // Return the variable representing the computed value.
        return {
            type: "computed",
            id: data.id,
        };
    }
    getVariable(variable, type) {
        if (variable.type === "external") {
            return this.getExternalVariable(variable.id, type);
        }
        if (variable.type === "output") {
            const id = variable.id;
            const index = this.FCT.calls.findIndex((call) => call.nodeId === id.nodeId);
            return this.getOutputVariable({
                index,
                innerIndex: id.innerIndex,
                type,
            });
        }
        if (variable.type === "global") {
            const globalVariable = globalVariables[variable.id];
            if (!globalVariable) {
                throw new Error("Global variable not found");
            }
            return globalVariable;
        }
        if (variable.type === "computed") {
            const computedVariables = this.computed;
            const index = computedVariables.findIndex((computedVariable) => {
                return computedVariable.id === variable.id;
            });
            return this.getComputedVariable(index, type);
        }
        throw new Error("Variable type not found");
    }
    getOutputVariable({ index, innerIndex, type = "uint256", }) {
        const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
        let base;
        let innerIndexHex;
        innerIndex = innerIndex ?? 0;
        if (innerIndex < 0) {
            innerIndexHex = ((innerIndex + 1) * -1).toString(16).padStart(4, "0");
            if (type.includes("bytes")) {
                base = FDBackBaseBytes;
            }
            else {
                base = FDBackBase;
            }
        }
        else {
            innerIndexHex = innerIndex.toString(16).padStart(4, "0");
            if (type.includes("bytes")) {
                base = FDBaseBytes;
            }
            else {
                base = FDBase;
            }
        }
        return (innerIndexHex + outputIndexHex).padStart(base.length, base);
    }
    getExternalVariable(index, type) {
        const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
        if (type.includes("bytes")) {
            return outputIndexHex.padStart(FCBaseBytes.length, FCBaseBytes);
        }
        return outputIndexHex.padStart(FCBase.length, FCBase);
    }
    getComputedVariable(index, type) {
        const outputIndexHex = (index + 1).toString(16).padStart(4, "0");
        if (type.includes("bytes")) {
            return outputIndexHex.padStart(ComputedBaseBytes.length, ComputedBaseBytes);
        }
        return outputIndexHex.padStart(ComputedBase.length, ComputedBase);
    }
    getValue(value, type, ifValueUndefined = "") {
        if (!value) {
            return ifValueUndefined;
        }
        if (typeof value === "string") {
            return value;
        }
        return this.getVariable(value, type);
    }
    getVariablesAsBytes32 = (variables) => {
        return Variables.getVariablesAsBytes32(variables);
    };
    static getVariablesAsBytes32 = (variables) => {
        return variables.map((v) => {
            if (isNaN(Number(v)) || utils$1.isAddress(v)) {
                return `0x${String(v).replace("0x", "").padStart(64, "0")}`;
            }
            return `0x${Number(v).toString(16).padStart(64, "0")}`;
        });
    };
}

const AbiCoder = ethers.utils.AbiCoder;
async function create(call) {
    return this._calls.create(call);
}
async function createMultiple(calls) {
    const callsCreated = [];
    for (const [index, call] of calls.entries()) {
        try {
            const createdCall = await this.create(call);
            callsCreated.push(createdCall);
        }
        catch (err) {
            if (err instanceof Error) {
                throw new Error(`Error creating call ${index + 1}: ${err.message}`);
            }
        }
    }
    return callsCreated;
}
function createPlugin({ plugin, initParams, }) {
    const Plugin = new plugin({
        chainId: this.chainId,
        initParams: initParams ?? {},
    });
    if (Plugin instanceof plugin) {
        return Plugin;
    }
    else {
        throw new Error(`Plugin creation failed: ${JSON.stringify(plugin)}`);
    }
}
function getCall(index) {
    if (index < 0 || index >= this.calls.length) {
        throw new Error("Index out of range");
    }
    return this.calls[index];
}
function exportFCT() {
    return new ExportFCT(this).get();
}
function exportNotificationFCT() {
    const allCallsAreViewOnly = this.calls.every((call) => call.options.callType === CALL_TYPE_MSG_REV["view only"]);
    if (!allCallsAreViewOnly) {
        throw new Error("All calls must be view only to create an notification FCT");
    }
    const currentCallDefaults = this._calls.getCallDefaults();
    this.setCallDefaults({
        options: {
            payerIndex: 0,
        },
    });
    const currentMaxGasPrice = this.options.maxGasPrice;
    this.setOptions({
        maxGasPrice: ethers.utils.parseUnits("1000", "gwei").toString(),
    });
    const fct = new ExportFCT(this).get();
    this.setCallDefaults(currentCallDefaults);
    this.setOptions({
        maxGasPrice: currentMaxGasPrice,
    });
    return fct;
}
function importFCT(fct) {
    const typedData = fct.typedData;
    const domain = typedData.domain;
    const { meta } = typedData.message;
    this.batchMultiSigSelector = meta.selector;
    this.version = meta.version;
    this.chainId = domain.chainId.toString();
    this.domain = domain;
    this.randomId = meta.random_id.slice(2);
    this.setOptions(SessionID.asOptions({
        sessionId: fct.sessionId,
        builder: fct.builder,
        externalSigners: fct.externalSigners,
        name: typedData.message.meta.name,
    }));
    const { types: typesObject } = typedData;
    for (const [index, call] of fct.mcall.entries()) {
        // Slice the first element because it is the call type
        const dataTypes = [...typedData.types[`transaction${index + 1}`]].slice(1);
        const { call: meta, ...parameters } = typedData.message[`transaction_${index + 1}`];
        let params = [];
        if (dataTypes.length > 0) {
            const signature = meta.method_interface;
            const functionName = signature.split("(")[0];
            const iface = new ethers.utils.Interface([`function ${signature}`]);
            const ifaceFunction = iface.getFunction(functionName);
            const inputs = ifaceFunction.inputs;
            params = FCTCalls.helpers.getParamsFromTypedData({
                methodInterfaceParams: inputs,
                parameters,
                types: typesObject,
                primaryType: `transaction${index + 1}`,
            });
        }
        const getFlow = () => {
            const flow = Object.entries(flows).find(([, value]) => {
                return value.text === meta.flow_control.toString();
            });
            if (!flow) {
                throw new Error("Flow control not found");
            }
            return Flow[flow[0]];
        };
        const nodeIndex = index + 1;
        const callInput = {
            nodeId: `node${nodeIndex}`,
            to: call.to,
            from: call.from,
            value: call.value,
            method: meta.method_interface.split("(")[0],
            params,
            toENS: meta.to_ens,
            options: {
                gasLimit: meta.gas_limit,
                jumpOnSuccess: meta.jump_on_success === 0 ? "" : `node${nodeIndex + 1 + meta.jump_on_success}`,
                jumpOnFail: meta.jump_on_fail === 0 ? "" : `node${nodeIndex + 1 + meta.jump_on_fail}`,
                flow: getFlow(),
                callType: CALL_TYPE_MSG_REV[meta.call_type],
                falseMeansFail: meta.returned_false_means_fail,
                permissions: meta.permissions.toString(),
                payerIndex: meta.payer_index,
            },
        };
        this._calls.createSimpleCall(callInput);
    }
    return this.calls;
}
async function importEncodedFCT(calldata) {
    const iface = Interfaces.FCT_BatchMultiSigCall;
    const chainId = this.chainId;
    const decoded = iface.decodeFunctionData("batchMultiSigCall", calldata);
    const arrayKeys = ["signatures", "mcall"];
    const objectKeys = ["tr"];
    const getFCT = (obj) => {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            if (!isNaN(parseFloat(key))) {
                return acc;
            }
            if (arrayKeys.includes(key)) {
                return {
                    ...acc,
                    [key]: value.map((sign) => getFCT(sign)),
                };
            }
            if (objectKeys.includes(key)) {
                return {
                    ...acc,
                    [key]: getFCT(value),
                };
            }
            if (key === "callId" || key === "sessionId") {
                return {
                    ...acc,
                    [key]: "0x" + value.toHexString().slice(2).padStart(64, "0"),
                };
            }
            if (key === "types") {
                return {
                    ...acc,
                    [key]: value.map((type) => type.toString()),
                };
            }
            return {
                ...acc,
                [key]: BigNumber.isBigNumber(value) ? value.toHexString() : value,
            };
        }, {});
    };
    const decodedFCT = getFCT(decoded);
    const FCTOptions = SessionID.asOptions({
        sessionId: decodedFCT.tr.sessionId,
        builder: decodedFCT.tr.builder,
        name: "",
        externalSigners: decodedFCT.tr.externalSigners,
    });
    this.setOptions(FCTOptions);
    for (const [index, call] of decodedFCT.tr.mcall.entries()) {
        try {
            const pluginData = getPlugin$1({
                address: call.to,
                chainId,
                signature: call.functionSignature,
            });
            if (!pluginData) {
                throw new Error("Plugin not found");
            }
            const plugin = new pluginData.plugin({
                chainId,
            });
            const params = plugin.methodParams;
            const decodedParams = params.length > 0
                ? new AbiCoder().decode(params.map((type) => `${type.type} ${type.name}`), call.data)
                : [];
            plugin.input.set({
                to: call.to,
                value: parseInt(call.value, 16).toString(),
                methodParams: params.reduce((acc, param) => {
                    const getValue = (value) => {
                        const variables = ["0xfb0", "0xfa0", "0xfc00000", "0xfd00000", "0xfdb000"];
                        if (BigNumber.isBigNumber(value)) {
                            const hexString = value.toHexString();
                            if (variables.some((v) => hexString.startsWith(v))) {
                                return hexString;
                            }
                            return value.toString();
                        }
                        return value;
                    };
                    const value = getValue(decodedParams[param.name]);
                    return { ...acc, [param.name]: value };
                }, {}),
            });
            const { options } = CallID.parse(call.callId);
            const callInput = {
                nodeId: `node${index + 1}`,
                plugin,
                from: call.from,
                options: options,
            };
            await this.create(callInput);
        }
        catch (e) {
            if (e.message !== "Multiple plugins found for the same signature, can't determine which one to use") {
                throw new Error(`Plugin error for call at index ${index} - ${e.message}`);
            }
            throw new Error(`Plugin not found for call at index ${index}`);
        }
    }
    return this.calls;
}

async function getPlugin(index) {
    const chainId = this.chainId;
    const call = this.getCall(index);
    if (instanceOfVariable(call.to)) {
        throw new Error("To value cannot be a variable");
    }
    const pluginData = getPlugin$1({
        signature: handleFunctionSignature(call),
        address: call.to,
        chainId: chainId,
    });
    if (!pluginData) {
        throw new Error("Plugin not found");
    }
    const pluginClass = pluginData.plugin;
    const plugin = new pluginClass({
        chainId: chainId.toString(),
    });
    plugin.input.set({
        to: call.to,
        value: call.value,
        methodParams: call.params
            ? call.params.reduce((acc, param) => {
                return { ...acc, [param.name]: param.value };
            }, {})
            : {},
    });
    return plugin;
}
async function getPluginClass(index) {
    const chainId = this.chainId;
    const call = this.getCall(index);
    if (instanceOfVariable(call.to)) {
        throw new Error("To value cannot be a variable");
    }
    const pluginData = getPlugin$1({
        signature: handleFunctionSignature(call),
        address: call.to,
        chainId: chainId.toString(),
    });
    return pluginData;
}
async function getPluginData(index) {
    const plugin = await this.getPlugin(index); // get the plugin from the index
    const call = this.getCall(index); // get the call from the index
    const input = {
        to: call.to,
        value: call.value,
        methodParams: call.params
            ? call.params.reduce((acc, param) => {
                return { ...acc, [param.name]: param.value };
            }, {})
            : {},
    };
    return {
        protocol: plugin.protocol,
        type: plugin.type,
        method: plugin.method,
        input,
    };
}

class BatchMultiSigCall {
    batchMultiSigSelector = "0xf6407ddd";
    version = "0x010101";
    chainId;
    domain;
    randomId = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    // Utils
    utils = new FCTUtils(this);
    variables = new Variables(this);
    _options = new Options();
    _calls = new FCTCalls(this, {
        value: "0",
        options: DEFAULT_CALL_OPTIONS,
    });
    constructor(input = {}) {
        if (input.chainId) {
            this.chainId = input.chainId;
        }
        else {
            this.chainId = "5"; // @todo This should be changed to mainnet in the future. For now we use Goerli
        }
        if (input.domain) {
            this.domain = input.domain;
        }
        else {
            const domain = EIP712.getTypedDataDomain(this.chainId);
            if (!domain)
                throw new Error(`ChainId ${this.chainId} is not supported. Please provide a custom EIP712 domain.`);
            this.domain = domain;
        }
        if (input.version)
            this.version = input.version;
        if (input.options)
            this.setOptions(input.options);
        if (input.defaults)
            this.setCallDefaults(input.defaults);
    }
    // Getters
    get options() {
        return this._options.get();
    }
    get calls() {
        return this._calls.get();
    }
    get decodedCalls() {
        return this._calls.getWithDecodedVariables();
    }
    get computed() {
        return this.variables.computed;
    }
    get computedWithValues() {
        return this.variables.computedWithValues;
    }
    get callDefaults() {
        return this._calls.getCallDefaults();
    }
    // Setters
    setOptions(options) {
        return this._options.set(options);
    }
    setCallDefaults(callDefault) {
        return this._calls.setCallDefaults(callDefault);
    }
    changeChainId = (chainId) => {
        this.chainId = chainId;
        const domain = EIP712.getTypedDataDomain(this.chainId);
        if (!domain)
            throw new Error(`ChainId ${this.chainId} is not supported. Please provide a custom EIP712 domain.`);
        this.domain = domain;
    };
    // Variables
    addComputed = (computed) => {
        return this.variables.addComputed(computed);
    };
    // Plugin functions
    getPlugin = getPlugin;
    getPluginClass = getPluginClass;
    getPluginData = getPluginData;
    createPlugin = createPlugin;
    // FCT Functions
    add = create;
    addMultiple = createMultiple;
    create = create;
    createMultiple = createMultiple;
    exportFCT = exportFCT;
    exportNotificationFCT = exportNotificationFCT;
    importFCT = importFCT;
    importEncodedFCT = importEncodedFCT;
    getCall = getCall;
    // Static functions
    static utils = utils;
    static from = (input) => {
        const batchMultiSigCall = new BatchMultiSigCall();
        batchMultiSigCall.importFCT(input);
        return batchMultiSigCall;
    };
}

// FCTE_KiroPriceUpdated event topic = 0xa9fb3015d4fdf1af5c13719bec86b7870426824a268fb0b3f0002ad32cd14ba3
const data = {
    5: {
        V2_Pool: "0x0D415c2496099DfBE817fc5A0285bE3d86b9FD8d",
        isToken0KIRO: true,
    },
    1: {
        V2_Pool: "0x5CD136E8197Be513B06d39730dc674b1E0F6b7da",
        isToken0KIRO: true,
    },
};
function decode144(val) {
    const RESOLUTION = BigInt(112);
    return val >> RESOLUTION;
}
const getMulticallContract = (chainId, provider) => {
    const multicallAddress = multicallContracts[chainId];
    if (!multicallAddress) {
        throw new Error(`No multicall address found for chainId ${chainId}`);
    }
    return new ethers.Contract(multicallAddress, [
        "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
    ], provider);
};
const getData = async ({ chainId, provider }) => {
    const poolAddress = data[chainId].V2_Pool;
    const actuatorAddress = addresses[chainId].Actuator;
    if (!poolAddress) {
        throw new Error(`No pool address found for chainId ${chainId}`);
    }
    const UniswapV2Pair = new ethers.utils.Interface([
        "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
        "function price0CumulativeLast() external view returns (uint)",
        "function price1CumulativeLast() external view returns (uint)",
    ]);
    const Actuator = Interfaces.FCT_Actuator;
    const multicallContract = getMulticallContract(chainId, provider);
    const [blockNumber, returnData] = await multicallContract.callStatic.aggregate([
        {
            target: poolAddress,
            callData: UniswapV2Pair.encodeFunctionData("price0CumulativeLast"),
        },
        {
            target: poolAddress,
            callData: UniswapV2Pair.encodeFunctionData("price1CumulativeLast"),
        },
        {
            target: poolAddress,
            callData: UniswapV2Pair.encodeFunctionData("getReserves"),
        },
        {
            target: actuatorAddress,
            callData: Actuator.encodeFunctionData("s_blockTimestampLast"),
        },
        {
            target: actuatorAddress,
            callData: Actuator.encodeFunctionData("s_price0CumulativeLast"),
        },
        {
            target: actuatorAddress,
            callData: Actuator.encodeFunctionData("s_price1CumulativeLast"),
        },
        {
            target: actuatorAddress,
            callData: Actuator.encodeFunctionData("s_timeBetweenKiroPriceUpdate"),
        },
        {
            target: actuatorAddress,
            callData: Actuator.encodeFunctionData("s_price0Average"),
        },
        {
            target: actuatorAddress,
            callData: Actuator.encodeFunctionData("s_price1Average"),
        },
    ]);
    // Decode return data
    const [price0CumulativeLast, price1CumulativeLast, getReserves, s_blockTimestampLast, s_price0CumulativeLast, s_price1CumulativeLast, s_timeBetweenKiroPriceUpdate, s_price0Average, s_price1Average,] = returnData.map((data, i) => {
        if (i === 2) {
            return UniswapV2Pair.decodeFunctionResult("getReserves", data);
        }
        return ethers.BigNumber.from(data);
    });
    return {
        blockNumber,
        price0CumulativeLast,
        price1CumulativeLast,
        getReserves,
        s_blockTimestampLast,
        s_price0CumulativeLast,
        s_price1CumulativeLast,
        s_timeBetweenKiroPriceUpdate,
        s_price0Average,
        s_price1Average,
    };
};
const getCumulativePrices = ({ blockTimestamp, getReserves, price0CumulativeLast, price1CumulativeLast, }) => {
    const { reserve0, reserve1, blockTimestampLast } = getReserves;
    function fraction(num, denom) {
        const numerator = BigInt(num);
        const denominator = BigInt(denom);
        const RESOLUTION = BigInt(112);
        const Q112 = BigInt(2 ** 112);
        if (numerator <= 2 ** 144 - 1) {
            const result = (numerator * BigInt(2) ** RESOLUTION) / denominator;
            if (result > 2 ** 224 - 1)
                throw Error("FixedPoint::fraction: overflow");
            return result;
        }
        else {
            const result = (numerator * Q112) / denominator;
            if (result > 2 ** 224 - 1)
                throw Error("FixedPoint::fraction: overflow");
            return result;
        }
    }
    const timeElapsed = blockTimestamp - blockTimestampLast;
    const price0Cumulative = fraction(reserve1.toString(), reserve0.toString()) * BigInt(timeElapsed) + BigInt(price0CumulativeLast.toString());
    const price1Cumulative = fraction(reserve0.toString(), reserve1.toString()) * BigInt(timeElapsed) + BigInt(price1CumulativeLast.toString());
    return {
        price0Cumulative,
        price1Cumulative,
    };
};
const getKIROPrice = async ({ chainId, rpcUrl, provider, blockTimestamp, }) => {
    if (!provider) {
        if (!rpcUrl) {
            throw new Error("Must provide either a provider or an rpcUrl");
        }
        provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    }
    blockTimestamp = (blockTimestamp || (await provider.getBlock("latest")).timestamp);
    const isToken0KIRO = data[chainId].isToken0KIRO;
    const { price0CumulativeLast, price1CumulativeLast, getReserves, s_blockTimestampLast, s_price0CumulativeLast, s_price1CumulativeLast, s_timeBetweenKiroPriceUpdate, s_price0Average, s_price1Average, } = await getData({ chainId, provider });
    const { price0Cumulative, price1Cumulative } = getCumulativePrices({
        blockTimestamp,
        getReserves: getReserves,
        price0CumulativeLast: price0CumulativeLast,
        price1CumulativeLast: price1CumulativeLast,
    });
    const timeElapsed = blockTimestamp - s_blockTimestampLast.toNumber();
    // If time elapsed is less than the time between KIRO price updates, we don't need to update the price
    if (timeElapsed < s_timeBetweenKiroPriceUpdate.toNumber()) {
        const priceAverage = isToken0KIRO ? s_price0Average : s_price1Average;
        return decode144(BigInt(priceAverage.toString()) * BigInt(1e18)).toString();
    }
    const price0Average = (price0Cumulative - BigInt(s_price0CumulativeLast.toString())) / BigInt(timeElapsed);
    const price1Average = (price1Cumulative - BigInt(s_price1CumulativeLast.toString())) / BigInt(timeElapsed);
    const priceAverage = isToken0KIRO ? price0Average : price1Average;
    return decode144(priceAverage * BigInt(1e18)).toString();
};

const transactionValidator = async (txVal) => {
    const { callData, actuatorContractAddress, actuatorPrivateKey, rpcUrl, activateForFree, gasPrice } = txVal;
    const decodedFCTCalldata = Interfaces.FCT_BatchMultiSigCall.decodeFunctionData("batchMultiSigCall", callData);
    const { maxGasPrice } = SessionID.parse(decodedFCTCalldata[1].sessionId.toHexString());
    if (BigInt(maxGasPrice) < BigInt(gasPrice.maxFeePerGas)) {
        return {
            isValid: false,
            txData: { gas: 0, ...gasPrice, type: 2 },
            prices: {
                gas: 0,
                gasPrice: gasPrice.maxFeePerGas,
            },
            error: "Max gas price set for the FCT is too high",
        };
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(actuatorPrivateKey, provider);
    const actuatorContract = new ethers.Contract(actuatorContractAddress, FCTActuatorABI, signer);
    try {
        const gas = await actuatorContract.estimateGas[activateForFree ? "activateForFree" : "activate"](callData, signer.address, { ...gasPrice });
        // Add 20% to gasUsed value, calculate with BigInt
        const gasUsed = Math.round(gas.toNumber() + gas.toNumber() * 0.2);
        return {
            isValid: true,
            txData: { gas: gasUsed, ...gasPrice, type: 2 },
            prices: { gas: gasUsed, gasPrice: gasPrice.maxFeePerGas },
            error: null,
        };
    }
    catch (err) {
        if (err.reason === "processing response error") {
            throw err;
        }
        if (txVal.errorIsValid) {
            return {
                isValid: true,
                txData: { gas: 1_000_000, ...gasPrice, type: 2 },
                prices: {
                    gas: 1_000_000,
                    gasPrice: gasPrice.maxFeePerGas,
                },
                error: null,
            };
        }
        return {
            isValid: false,
            txData: { gas: 0, ...gasPrice, type: 2 },
            prices: {
                gas: 0,
                gasPrice: gasPrice.maxFeePerGas,
            },
            error: err.reason,
        };
    }
};

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    FetchUtility: FetchUtility,
    fetchCurrentApprovals: fetchCurrentApprovals,
    getGasPrices: getGasPrices,
    getKIROPrice: getKIROPrice,
    transactionValidator: transactionValidator
});

export { BatchMultiSigCall, index$2 as constants, index as utils, index$1 as variables };
