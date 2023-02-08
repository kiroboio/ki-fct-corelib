import * as dotenv from "dotenv";
import _ from "lodash";

dotenv.config();

const chainId = "5";

async function main() {
  // const gasPrices = await utils.getGasPrices({
  //   rpcUrl: scriptData[chainId].rpcUrl,
  // });
  // const fct = new BatchMultiSigCall({
  //   chainId,
  // });

  const testObject = {
    foo: {
      bar: "baz",
    },
  };
  const testObject2 = {
    foo: {
      hello: "world",
      bar: "baz2",
    },
  };

  const merge = _.merge(testObject, testObject2);
  console.log("merge", merge);

  // fct.importFCT(FCT);
  // const plugin = await fct.getPluginData(0);
  // console.log("Plugin data", plugin);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
