import NodeCache from "node-cache";

export const FCTCache = new NodeCache({
  useClones: false,
});
