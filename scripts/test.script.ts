// Init dotenv
import console from "console";
import * as dotenv from "dotenv";

// https://testapi.kirobo.me/v1/eth/goerli/fct/getfct/<message hash>?key=process.env.LIOR_SERVICE_KEY
import { BatchMultiSigCall, ERC20, ethers } from "../src";
import { addresses } from "../src/constants";

dotenv.config();

const activator = "0x4c508dc4a3aacbecbf13c1d543b4936274033110";
const receiver = ethers.Wallet.createRandom().address;

async function main() {
  const FCT = new BatchMultiSigCall({ chainId: "1" });

  const WETH = new ERC20.actions.Transfer({
    chainId: "1",
    initParams: {
      to: addresses[1].WETH,
      methodParams: {
        amount: "100",
        recipient: receiver,
      },
    },
  });

  await FCT.add({
    plugin: WETH,
    nodeId: "WETH",
    from: activator,
  });

  const data = await FCT.exportWithPayment(activator);

  console.log(JSON.stringify(data, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
