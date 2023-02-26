import { CallOptions, DeepRequired } from "types";

import { Flow } from "../constants/flows";

export const addresses = {
  1: {
    // NOTE: These addresses are not correct since no contracts have been deployed on mainnet
    // TODO: Update these addresses once contracts have been deployed on mainnet
    FCT_Controller: "0x087550a787B2720AAC06351065afC1F413D82572",
    FCT_BatchMultiSig: "0x067D176d13651c8AfF7964a4bB9dF3107F893e88",
    FCT_EnsManager: "0x7DA33a8606BF2F752D473238ff8681b53cf30976",
    FCT_Tokenomics: "0xFE4fEC781Bd626751249ABb1b15375f3370B9c79",
    Actuator: "0x6B271aEa169B4804D1d709B2687c17c3Cc8E2e56",
    ActuatorCore: "0xC76b674d3e33cd908055F295c945F1cd575b7df2",
  },
  5: {
    FCT_Controller: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
    FCT_BatchMultiSig: "0xF7Fa1292f19abE979cE7d2EfF037a7F13F26F4cC",
    FCT_EnsManager: "0xB9DBD91e7cC0A4d7635d18FB33416D784EBe2524",
    FCT_Tokenomics: "0xB09E0B70dffDe2968EBDa24855D05DC7a1663F5C",
    Actuator: "0x905e7a9a0Bb9755938E73A0890d603682DC2cD9C",
    ActuatorCore: "0xD33D02BF33EA0A3FA8eB75c4a23b19452cCcE106",
  },
};

export const EIP712_RECURRENCY = [
  { name: "max_repeats", type: "uint16" },
  { name: "chill_time", type: "uint32" },
  { name: "accumetable", type: "bool" },
];

export const EIP712_MULTISIG = [
  { name: "external_signers", type: "address[]" },
  { name: "minimum_approvals", type: "uint8" },
];

export const NO_JUMP = "NO_JUMP";

export const DEFAULT_CALL_OPTIONS: DeepRequired<CallOptions> = {
  permissions: "0000",
  gasLimit: "0",
  flow: Flow.OK_CONT_FAIL_REVERT,
  jumpOnSuccess: NO_JUMP,
  jumpOnFail: NO_JUMP,
  falseMeansFail: false,
  callType: "ACTION",
};
