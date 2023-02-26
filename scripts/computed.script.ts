import _ from "lodash";
import util from "util";

import { BatchMultiSigCall } from "../src";

async function main() {
  const FCT = new BatchMultiSigCall();

  FCT.addComputed({
    id: "test",
    value: "1200",
  });

  FCT.addComputed({
    id: "test2",
    value: {
      type: "computed",
      id: "test",
    },
    add: "2",
  });

  await FCT.create({
    nodeId: "node1",
    to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
    toENS: "@token.kiro.eth",
    method: "transfer",
    params: [
      { name: "recipient", type: "address", value: "0x4f631612941F710db646B8290dB097bFB8657dC2" },
      {
        name: "amount",
        type: "uint256",
        value: {
          type: "computed",
          id: "test",
        },
      },
    ],
    from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
  });

  const exportedFCT = FCT.exportFCT();

  console.log(util.inspect(exportedFCT, false, null, true));

  const test = {
    something: {
      is: {
        here: {
          and: {
            here: "test",
          },
        },
      },
    },
  };

  const hasTest = (obj: object) => {
    if (_.has(obj, "test")) {
      return true;
    }
    return _.some(obj, (value) => {
      if (_.isObject(value)) {
        return hasTest(value);
      }
      return false;
    });
  };

  console.log(_.has(test, "test"));
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((err) => {
    console.error(err);
  });
