"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNodeId = void 0;
function generateNodeId() {
    return [...Array(20)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}
exports.generateNodeId = generateNodeId;
//# sourceMappingURL=misc.js.map