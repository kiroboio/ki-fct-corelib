"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCTCache = void 0;
const tslib_1 = require("tslib");
const node_cache_1 = tslib_1.__importDefault(require("node-cache"));
exports.FCTCache = new node_cache_1.default({
    useClones: false,
});
//# sourceMappingURL=cache.js.map