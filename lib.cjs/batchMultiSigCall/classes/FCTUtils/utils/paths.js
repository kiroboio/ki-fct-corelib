"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPathsFromGraph = exports.manageFCTNodesInGraph = exports.getJumpIndexes = void 0;
const constants_1 = require("../../../../constants");
function getJumpIndex({ FCT, jumpNodeId, index }) {
    if (!jumpNodeId || jumpNodeId === "NO_JUMP") {
        return 0;
    }
    return FCT.getIndexByNodeId(jumpNodeId) - index - 1;
}
function getJumpIndexes({ FCT, jumpOnSuccessNodeId, jumpOnFailNodeId, index, }) {
    return {
        jumpOnSuccess: getJumpIndex({ FCT, jumpNodeId: jumpOnSuccessNodeId, index }),
        jumpOnFail: getJumpIndex({ FCT, jumpNodeId: jumpOnFailNodeId, index }),
    };
}
exports.getJumpIndexes = getJumpIndexes;
function manageFCTNodesInGraph({ calls, FCT, g }) {
    calls.forEach((_, index) => {
        g.setNode(index.toString());
    });
    const continueOnSuccessFlows = [constants_1.Flow.OK_CONT_FAIL_REVERT, constants_1.Flow.OK_CONT_FAIL_STOP, constants_1.Flow.OK_CONT_FAIL_CONT];
    const continueOnFailFlows = [constants_1.Flow.OK_REVERT_FAIL_CONT, constants_1.Flow.OK_STOP_FAIL_CONT, constants_1.Flow.OK_CONT_FAIL_CONT];
    const endFlows = [
        constants_1.Flow.OK_STOP_FAIL_STOP,
        constants_1.Flow.OK_STOP_FAIL_REVERT,
        constants_1.Flow.OK_REVERT_FAIL_STOP,
        constants_1.Flow.OK_CONT_FAIL_STOP,
        constants_1.Flow.OK_STOP_FAIL_CONT,
    ];
    const dontAddEdge = [constants_1.Flow.OK_STOP_FAIL_STOP, constants_1.Flow.OK_STOP_FAIL_REVERT, constants_1.Flow.OK_REVERT_FAIL_STOP];
    const ends = [(calls.length - 1).toString()];
    for (let i = 0; i < calls.length - 1; i++) {
        const call = calls[i];
        const options = call.options;
        const flow = options.flow;
        const { jumpOnSuccess, jumpOnFail } = getJumpIndexes({
            FCT,
            jumpOnSuccessNodeId: options.jumpOnSuccess,
            jumpOnFailNodeId: options.jumpOnFail,
            index: i,
        });
        if (jumpOnSuccess === jumpOnFail) {
            if (!dontAddEdge.includes(flow)) {
                g.setEdge(i.toString(), (i + 1 + +jumpOnSuccess).toString());
            }
        }
        else {
            if (continueOnSuccessFlows.includes(flow)) {
                g.setEdge(i.toString(), (i + 1 + +jumpOnSuccess).toString());
            }
            if (continueOnFailFlows.includes(flow)) {
                g.setEdge(i.toString(), (i + 1 + +jumpOnFail).toString());
            }
        }
        if (endFlows.includes(flow)) {
            ends.push(i.toString());
        }
    }
    return ends;
}
exports.manageFCTNodesInGraph = manageFCTNodesInGraph;
function getPathsFromGraph({ g, ends }) {
    const start = "0";
    const allPaths = [];
    const pathList = [start];
    const uniqueEnds = Array.from(new Set(ends));
    for (const end of uniqueEnds) {
        const printAllPathsUtil = (g, start, end, localPathList) => {
            if (start === end) {
                const path = localPathList.slice();
                allPaths.push(path);
                return;
            }
            let successors = g.successors(start);
            if (successors === undefined) {
                successors = [];
            }
            for (const id of successors) {
                localPathList.push(id);
                printAllPathsUtil(g, id, end, localPathList);
                localPathList.splice(localPathList.indexOf(id), 1);
            }
        };
        printAllPathsUtil(g, start, end, pathList);
    }
    return allPaths;
}
exports.getPathsFromGraph = getPathsFromGraph;
//# sourceMappingURL=paths.js.map