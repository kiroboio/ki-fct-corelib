import { Graph } from "graphlib";

import { Flow } from "../../../../constants";
import { BatchMultiSigCall } from "../../../batchMultiSigCall";
import { Call } from "../../Call";

function getJumpIndex({ FCT, jumpNodeId, index }: { FCT: BatchMultiSigCall; jumpNodeId: string; index: number }) {
  if (!jumpNodeId || jumpNodeId === "NO_JUMP") {
    return 0;
  }

  return FCT.getIndexByNodeId(jumpNodeId) - index - 1;
}

export function getJumpIndexes({
  FCT,
  jumpOnSuccessNodeId,
  jumpOnFailNodeId,
  index,
}: {
  FCT: BatchMultiSigCall;
  jumpOnSuccessNodeId: string;
  jumpOnFailNodeId: string;
  index: number;
}) {
  return {
    jumpOnSuccess: getJumpIndex({ FCT, jumpNodeId: jumpOnSuccessNodeId, index }),
    jumpOnFail: getJumpIndex({ FCT, jumpNodeId: jumpOnFailNodeId, index }),
  };
}

export function manageFCTNodesInGraph({ calls, FCT, g }: { calls: Call[]; FCT: BatchMultiSigCall; g: Graph }) {
  calls.forEach((_, index) => {
    g.setNode(index.toString());
  });

  const continueOnSuccessFlows = [Flow.OK_CONT_FAIL_REVERT, Flow.OK_CONT_FAIL_STOP, Flow.OK_CONT_FAIL_CONT];
  const continueOnFailFlows = [Flow.OK_REVERT_FAIL_CONT, Flow.OK_STOP_FAIL_CONT, Flow.OK_CONT_FAIL_CONT];
  const endFlows = [
    Flow.OK_STOP_FAIL_STOP,
    Flow.OK_STOP_FAIL_REVERT,
    Flow.OK_REVERT_FAIL_STOP,
    Flow.OK_CONT_FAIL_STOP,
    Flow.OK_STOP_FAIL_CONT,
  ];
  const dontAddEdge = [Flow.OK_STOP_FAIL_STOP, Flow.OK_STOP_FAIL_REVERT, Flow.OK_REVERT_FAIL_STOP];

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
    } else {
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

export function getPathsFromGraph({ g, ends }: { g: Graph; ends: string[] }) {
  const start = "0";
  const allPaths: string[][] = [];
  const pathList: string[] = [start];

  const uniqueEnds = Array.from(new Set(ends));
  for (const end of uniqueEnds) {
    const printAllPathsUtil = (g: Graph, start: string, end: string, localPathList: string[]) => {
      if (start === end) {
        const path = localPathList.slice();
        allPaths.push(path);
        return;
      }

      let successors = g.successors(start);
      if (successors === undefined) {
        successors = [];
      }

      for (const id of successors as string[]) {
        localPathList.push(id);
        printAllPathsUtil(g, id, end, localPathList);
        localPathList.splice(localPathList.indexOf(id), 1);
      }
    };

    printAllPathsUtil(g, start, end, pathList);
  }

  return allPaths;
}
