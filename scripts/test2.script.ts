// // Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ethers } from "../src";
import FCTData from "./fail.json";

dotenv.config();

const sig = {
  r: "0xfe31c2c296a2b74a2cbc72ab50f829e081f938f336594982430f7a00b61ae543",
  s: "0x452d3a92d46164c0b539c4f25e8a06340dd87149e8eabbdf02e2c9b3aa925b01",
  _vs: "0x452d3a92d46164c0b539c4f25e8a06340dd87149e8eabbdf02e2c9b3aa925b01",
  recoveryParam: 0,
  v: 27,
  yParityAndS: "0x452d3a92d46164c0b539c4f25e8a06340dd87149e8eabbdf02e2c9b3aa925b01",
  compact:
    "0xfe31c2c296a2b74a2cbc72ab50f829e081f938f336594982430f7a00b61ae543452d3a92d46164c0b539c4f25e8a06340dd87149e8eabbdf02e2c9b3aa925b01",
};

const randAddr = () => ethers.Wallet.createRandom().address;

async function main() {
  const FCT = BatchMultiSigCall.from(FCTData);

  const signers = FCT.utils.getSigners();

  console.log("Signers", signers);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
