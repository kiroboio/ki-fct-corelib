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
    FCT_Controller: "0x7A45405D953974998fc447C196Fb015DC41C0650",
    FCT_BatchMultiSig: "0x2174679B326bE7B0888b54CaAdE1FE644DCfd309",
    FCT_EnsManager: "0xa51b9A359A87dB485Fcb87C358C58b123C2f9688",
    FCT_Tokenomics: "0xc074EEC205576C657a8EBDFeA8FCCd1a2924f193",
    Actuator: "0x4171ef9EB2CF074ECaA058Bd8e0F109C0ad4C6d1",
    ActuatorCore: "0x27C133a452303195b237fe920442891FeF609c54",
  },
  421613: {
    FCT_Controller: "0x574F4cDAB7ec20E3A37BDE025260F0A2359503d6",
    FCT_BatchMultiSig: "0x3628BE9E0BEfE4406cDFCA72E51d40d3902B9a22",
    FCT_EnsManager: "0x40b3dA447BE499e0D8165b314EB77e2356d0a92f",
    FCT_Tokenomics: "0x4F741c8106a01d7bAd583aB8937B625d662F0530",
    Actuator: "0x0E3b88a54b4ac2cAA5aD69E5B2E8254dB669c5d7",
    ActuatorCore: "0xfE406d3285a6C5D45Dad771aaD1BD7dADcDb00A0",
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
