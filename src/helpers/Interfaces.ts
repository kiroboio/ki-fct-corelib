import { ethers } from "ethers";

import FCTActuatorABI from "../abi/FCT_Actuator.abi.json";
import FCTBatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import FCTControllerABI from "../abi/FCT_Controller.abi.json";

export class Interface {
  static FCT_Controller = new ethers.utils.Interface(FCTControllerABI);
  static FCT_BatchMultiSigCall = new ethers.utils.Interface(FCTBatchMultiSigCallABI);
  static FCT_Actuator = new ethers.utils.Interface(FCTActuatorABI);
}
