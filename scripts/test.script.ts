// // Init dotenv
import * as dotenv from "dotenv";

import { BatchMultiSigCall, ethers } from "../src";
import FCTData from "./fail.json";

dotenv.config();

const randAddr = () => ethers.Wallet.createRandom().address;

async function main() {
  // const chainId = "1";
  // const FCT = new BatchMultiSigCall();

  // const data = [
  //   {
  //     nodeId: "0b41e4e1-ae74-469d-a2a4-08af80d66d5b",
  //     from: "0x2dFf96721a29D532508863e168e8e9e8A3dE9ED2",
  //     plugin:
  //       '{"type":"ACTION","name":"wrapETH","protocol":"UTILITY","method":"deposit","methodInterface":"deposit()","methodInterfaceHash":"0xd0e30db03f2e24c6531d8ae2f6c09d8e7a6ad7f7e87a81cb75dfda61c9d83286","contractInterface":"deposit()","contractInterfaceReturns":"","input":{"to":"0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6","value":{"id":"4e23a966-5442-4855-8f44-03cdeb4f73cb","type":"computed"},"methodParams":{}},"output":{},"inputWithMeta":{"to":{"key":"to","ioType":"INPUT","appType":"address","fctType":"address","value":"0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6","hidden":false,"required":true,"hashed":false,"mode":"ALL","destination":"wrapped_ether","readonly":false,"isMultiParam":false},"value":{"key":"value","ioType":"INPUT","appType":"integer","fctType":"uint256","value":{"id":"4e23a966-5442-4855-8f44-03cdeb4f73cb","type":"computed"},"hidden":false,"required":true,"hashed":false,"mode":"ALL","destination":"wei_amount","readonly":false,"isMultiParam":false},"methodParams":{}},"outputWithMeta":{},"inputList":[{"key":"to","ioType":"INPUT","appType":"address","fctType":"address","value":"0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6","hidden":false,"required":true,"hashed":false,"mode":"ALL","destination":"wrapped_ether","readonly":false,"isMultiParam":false},{"key":"value","ioType":"INPUT","appType":"integer","fctType":"uint256","value":{"id":"4e23a966-5442-4855-8f44-03cdeb4f73cb","type":"computed"},"hidden":false,"required":true,"hashed":false,"mode":"ALL","destination":"wei_amount","readonly":false,"isMultiParam":false}],"outputList":[]}',
  //     options: { flow: "OK_STOP_FAIL_REVERT", jumpOnSuccess: "", jumpOnFail: "" },
  //   },
  // ];

  // const computed = {
  //   id: "4e23a966-5442-4855-8f44-03cdeb4f73cb",
  //   type: "computed",
  //   value1: "2000000000000000000",
  //   operator1: "+",
  //   value2: "1000000000000000000",
  //   operator2: "",
  //   value3: "",
  //   operator3: "",
  //   value4: "",
  //   overflowProtection: true,
  // };

  // FCT.addComputed(computed);

  // const WrapETH = new Utility.actions.WrapETH({
  //   chainId: "1",
  //   initParams: {
  //     value: { id: "4e23a966-5442-4855-8f44-03cdeb4f73cb", type: "computed" } as any,
  //   },
  // });

  // await FCT.add({
  //   plugin: WrapETH,
  //   from: randAddr(),
  // });

  // const FCTData = FCT.export();
  // // writeFileSync("./scripts/FCT1.json", JSON.stringify(FCTData, null, 2));

  const FCT2 = BatchMultiSigCall.from(FCTData);

  const exportedData = FCT2.export();

  console.log("Export works", exportedData);

  const payment = FCT2.utils.getPaymentPerPayer({
    ethPriceInKIRO: "1",
  });

  console.log("Payment works", payment);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
