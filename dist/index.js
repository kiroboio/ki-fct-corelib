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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.variables = exports.constants = exports.utils = exports.BatchMultiSigCall = exports.ethers = void 0;
var ethers_1 = require("ethers");
Object.defineProperty(exports, "ethers", { enumerable: true, get: function () { return ethers_1.ethers; } });
const utils_1 = __importDefault(require("./utils"));
exports.utils = utils_1.default;
const constants_1 = __importDefault(require("./constants"));
exports.constants = constants_1.default;
const variables_1 = __importDefault(require("./variables"));
exports.variables = variables_1.default;
__exportStar(require("@kirobo/ki-eth-fct-provider-ts"), exports);
var batchMultiSigCall_1 = require("./batchMultiSigCall");
Object.defineProperty(exports, "BatchMultiSigCall", { enumerable: true, get: function () { return batchMultiSigCall_1.BatchMultiSigCall; } });
__exportStar(require("./batchMultiSigCall/interfaces"), exports);
