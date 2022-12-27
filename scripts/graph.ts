import { Graph } from "graphlib";

async function main() {
  const g = new Graph({ directed: true });

  const allPaths: string[][] = [];

  const printAllPaths = (g: Graph, start: string, end: string) => {
    const isVisited = {};
    const pathList: string[] = [];

    pathList.push(start);

    printAllPathsUtil(g, start, end, isVisited, pathList);
  };

  const printAllPathsUtil = (g: Graph, start: string, end: string, isVisited: object, localPathList: string[]) => {
    if (start === end) {
      const path = localPathList.slice();

      allPaths.push(path);
      return;
    }

    isVisited[start] = true;

    let successors = g.successors(start);

    if (successors === undefined) {
      successors = [];
    }

    for (const id of successors as string[]) {
      if (!isVisited[id]) {
        // store current node
        // in path[]
        localPathList.push(id);

        printAllPathsUtil(g, id, end, isVisited, localPathList);

        // remove current node
        // in path[]
        localPathList.splice(localPathList.indexOf(id), 1);
      }
    }

    isVisited[start] = false;
  };

  g.setNode("A");
  g.setNode("B");
  g.setNode("C");
  g.setNode("D");
  g.setNode("E");
  g.setNode("F");

  g.setEdge("A", "B");
  g.setEdge("B", "C");
  g.setEdge("C", "D");
  g.setEdge("D", "E");
  g.setEdge("E", "F");

  g.setEdge("A", "E");
  g.setEdge("B", "D");
  g.setEdge("C", "F");

  printAllPaths(g, "A", "F");

  console.log("allPaths", allPaths);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
