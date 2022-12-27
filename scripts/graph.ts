import { Graph } from "graphlib";

const printAllPaths = (g: Graph, start: string, end: string) => {
  const isVisited = new Array(g.nodes().length);
  const allRoutes: string[][] = [];
  for (let i = 0; i < isVisited.length; i++) {
    isVisited[i] = false;
    const pathList: string[] = [];

    pathList.push(start);

    const genPathList = printAllPathsUtil(g, start, end, isVisited, pathList);
    console.log("genPathList", genPathList);

    allRoutes.push(pathList);
  }

  return allRoutes;
};

const printAllPathsUtil = (g: Graph, start: string, end: string, isVisited: boolean[], localPathList: string[]) => {
  if (start === end) {
    return localPathList;
  }

  isVisited[start] = true;

  const successors = g.successors(start);

  if (successors === undefined) {
    isVisited[start] = false;
    return localPathList;
  }

  for (let i = 0; i < (successors as string[]).length; i++) {
    if (!isVisited[successors[i]]) {
      // store current node
      // in path[]
      localPathList.push(successors[i]);
      console.log("localPathList", localPathList);

      printAllPathsUtil(g, successors[i], end, isVisited, localPathList);

      // remove current node
      // in path[]
      localPathList.splice(localPathList.indexOf(successors[i]), 1);
    }
  }

  console.log("localPathList", localPathList);

  isVisited[start] = false;
  return localPathList;
};

async function main() {
  const g = new Graph({ directed: true });

  g.setNode("A");
  g.setNode("B");
  g.setNode("C");
  g.setNode("D");

  g.setEdge("A", "B");
  g.setEdge("B", "C");
  g.setEdge("B", "D");
  g.setEdge("C", "D");

  console.log(printAllPaths(g, "A", "D"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
