// Init dotenv
import console from "console";
import * as dotenv from "dotenv";

// https://testapi.kirobo.me/v1/eth/goerli/fct/getfct/<message hash>?key=process.env.LIOR_SERVICE_KEY
import { BatchMultiSigCall, ethers } from "../src";
import FCTData from "./aLotOfGasFCT.json";

dotenv.config();

const activator = "0x4c508dc4a3aacbecbf13c1d543b4936274033110";
const receiver = ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const cost = FCT.utils.getPaymentPerPayer({
    ethPriceInKIRO: "10",
    gasPrice: "25" + "0".repeat(9),
  });

  console.log(JSON.stringify(cost, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
