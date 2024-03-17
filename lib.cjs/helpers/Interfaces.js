"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interfaces = void 0;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const ERC20_abi_json_1 = tslib_1.__importDefault(require("../abi/ERC20.abi.json"));
const FCT_Actuator_abi_json_1 = tslib_1.__importDefault(require("../abi/FCT_Actuator.abi.json"));
const FCT_BatchMultiSigCall_abi_json_1 = tslib_1.__importDefault(require("../abi/FCT_BatchMultiSigCall.abi.json"));
const FCT_Controller_abi_json_1 = tslib_1.__importDefault(require("../abi/FCT_Controller.abi.json"));
const MulticallABI = [
    "function aggregate((address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
    "function getEthBalance(address addr) external view returns (uint256 balance)",
];
class Interfaces {
    static FCT_Controller = new ethers_1.ethers.utils.Interface(FCT_Controller_abi_json_1.default);
    static FCT_BatchMultiSigCall = new ethers_1.ethers.utils.Interface(FCT_BatchMultiSigCall_abi_json_1.default);
    static FCT_Actuator = new ethers_1.ethers.utils.Interface(FCT_Actuator_abi_json_1.default);
    static Multicall = new ethers_1.ethers.utils.Interface(MulticallABI);
    static ERC20 = new ethers_1.ethers.utils.Interface(ERC20_abi_json_1.default);
}
exports.Interfaces = Interfaces;
//# sourceMappingURL=Interfaces.js.map