import { Flow } from "../constants/flows";
import { CallOptions, DeepRequired } from "../types";

export const addresses = {
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

export const DEFAULT_CALL_OPTIONS: DeepRequired<Omit<CallOptions, "payerIndex">> = {
  permissions: "0000",
  gasLimit: "0",
  flow: Flow.OK_CONT_FAIL_REVERT,
  jumpOnSuccess: NO_JUMP,
  jumpOnFail: NO_JUMP,
  falseMeansFail: false,
  callType: "ACTION",
  validation: "",
};
