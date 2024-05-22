import { Graph } from "graphlib";
import { BatchMultiSigCall } from "../../../batchMultiSigCall";
import { Call } from "../../Call";
export declare function getJumpIndexes({ FCT, jumpOnSuccessNodeId, jumpOnFailNodeId, index, }: {
    FCT: BatchMultiSigCall;
    jumpOnSuccessNodeId: string;
    jumpOnFailNodeId: string;
    index: number;
}): {
    jumpOnSuccess: number;
    jumpOnFail: number;
};
export declare function manageFCTNodesInGraph({ calls, FCT, g }: {
    calls: Call[];
    FCT: BatchMultiSigCall;
    g: Graph;
}): string[];
export declare function getPathsFromGraph({ g, ends }: {
    g: Graph;
    ends: string[];
}): string[][];
//# sourceMappingURL=paths.d.ts.map