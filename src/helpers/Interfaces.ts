import { ethers } from "ethers";

import FCTActuatorABI from "../abi/FCT_Actuator.abi.json";
import FCTBatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import FCTControllerABI from "../abi/FCT_Controller.abi.json";

const MulticallABI = [
  "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
];
export class Interfaces {
  static FCT_Controller = new ethers.utils.Interface(FCTControllerABI);
  static FCT_BatchMultiSigCall = new ethers.utils.Interface(FCTBatchMultiSigCallABI);
  static FCT_Actuator = new ethers.utils.Interface(FCTActuatorABI);
  static Multicall = new ethers.utils.Interface(MulticallABI);
}
