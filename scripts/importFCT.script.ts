import * as dotenv from "dotenv";
import util from "util";

import FCTData from "../FCT.json";
import { BatchMultiSigCall } from "../src";
// import { BatchMultiSigCall } from "../src";

dotenv.config();

async function main() {
  const FCT = new BatchMultiSigCall();

  FCT.importFCT(FCTData);

  const exportFCT = FCT.exportFCT();

  console.log(util.inspect(exportFCT, false, null, true));

  // const signature = "transfer((address,uint256,(address)))";
  // const dataTypes = [{ name: "data", type: "Struct1" }];

  // const iface = new ethers.utils.Interface([`function ${signature}`]);

  // const ifaceFunction = iface.getFunction("transfer");
  // const inputs = ifaceFunction.inputs;

  // //Create a functions that goes through all the inputs and adds the name of the parameter
  // const addNameToParameter = (
  //   inputs: ethers.utils.ParamType[],
  //   dataTypes: { name: string; type: string }[]
  // ): ParamType[] => {
  //   return inputs.map((input, index) => {
  //     const dataType = dataTypes[index];
  //     if (input.type.includes("tuple")) {
  //       const data = {
  //         ...input,
  //         name: dataType.name,
  //         components: addNameToParameter(input.components, types[dataType.type as keyof typeof types]),
  //       };
  //       return ParamType.from(data);
  //     }
  //     return ParamType.from({
  //       ...input,
  //       name: dataType.name,
  //     });
  //   });
  // };

  // const functionSignatureHash = ethers.utils.id(signature);
  // const updatedInputs = addNameToParameter(inputs, dataTypes);
  // const encodedDataWithSignatureHash = functionSignatureHash.slice(0, 10) + encodedData.slice(2);
  // const decodedResult = iface.decodeFunctionData("transfer", encodedDataWithSignatureHash);
  // console.log(util.inspect(updatedInputs, false, null, true));

  // const params = getParamsFromInputs(updatedInputs, decodedResult);
  // console.log(util.inspect(params, false, null, true));
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

// TransactionDescription {
//   args: [
//     '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//     '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C',
//     { BigNumber: "1000000000000000000" },
//     amount: { BigNumber: "1000000000000000000" },
//     from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
//     to: '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C'
//   ],
//   functionFragment: [class FunctionFragment],
//   name: 'transferFrom',
//   sighash: '0x23b872dd',
//   signature: 'transferFrom(address,address,uint256)',
//   value: { BigNumber: "1000000000000000000" }
// }
