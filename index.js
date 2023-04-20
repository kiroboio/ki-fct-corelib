"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCTBatchMultiSigCall = exports.variables = exports.utils = exports.constants = exports.ethers = exports.pluginUtils = void 0;
__exportStar(require("@kirobo/ki-eth-fct-provider-ts"), exports);
var ki_eth_fct_provider_ts_1 = require("@kirobo/ki-eth-fct-provider-ts");
Object.defineProperty(exports, "pluginUtils", { enumerable: true, get: function () { return ki_eth_fct_provider_ts_1.utils; } });
var ethers_1 = require("ethers");
Object.defineProperty(exports, "ethers", { enumerable: true, get: function () { return ethers_1.ethers; } });
// Utils exports
exports.constants = __importStar(require("./constants"));
exports.utils = __importStar(require("./utils"));
exports.variables = __importStar(require("./variables"));
// BatchMultiSigCall exports (utils and helpers)
exports.FCTBatchMultiSigCall = __importStar(require("./batchMultiSigCall"));
// FCT class exports
__exportStar(require("./methods"), exports);
// Type exports
__exportStar(require("./types"), exports);
