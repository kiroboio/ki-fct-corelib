import { Flow } from "../constants";
import { CallOptions, DeepRequired } from "../types";

export const addresses = {
  1: {
    FCT_Controller: "0x0A0ea58E6504aA7bfFf6F3d069Bd175AbAb638ee",
    FCT_BatchMultiSig: "0xee261D709227e0Bf1037D3Cd5D45becD8B93f712",
    FCT_EnsManager: "0x30B25912faeb6E9B70c1FD9F395D2fF2083C966C",
    FCT_Tokenomics: "0xB6E0d8DCc868061faAf38D3Bf00793592ff68484",
    Actuator: "0x1332e1A702DaC73523708F95827E6b706DAE5fD9",
    ActuatorCore: "0xde841c9344E3C770a59102C8E61AFF699D8c4585",
  },
  5: {
    FCT_Controller: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
    FCT_BatchMultiSig: "0xf1E8Aca842bF40ee2f0bD70AfEbaA37b26a68fDD",
    FCT_EnsManager: "0xB9DBD91e7cC0A4d7635d18FB33416D784EBe2524",
    FCT_Tokenomics: "0x47Fca35c6fAb9E90a1ccf2630941fF64866fD3d2",
    Actuator: "0x862A8FB429195d735106c06C4e352E305d8c7B31",
    ActuatorCore: "0x2301F7d5A833395733F92fdf68B8Eb15aC757dF9",
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
