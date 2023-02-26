import * as dotenv from "dotenv";
import util from "util";

import FCTData from "../FCT.json";
import { BatchMultiSigCall } from "../src";
// import { BatchMultiSigCall } from "../src";

const encoded =
  "0x0000000000000000000000009650578ebd1b08f98af81a84372ece4b448d7526000000000000000000000000fc00000000000000000000000000000000000002000000000000000000000000fc00000000000000000000000000000000000003";

const typedData = FCTData.typedData;

const typesObject = {
  EIP712Domain: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "version",
      type: "string",
    },
    {
      name: "chainId",
      type: "uint256",
    },
    {
      name: "verifyingContract",
      type: "address",
    },
    {
      name: "salt",
      type: "bytes32",
    },
  ],
  BatchMultiSigCall: [
    {
      name: "meta",
      type: "Meta",
    },
    {
      name: "limits",
      type: "Limits",
    },
    {
      name: "recurrency",
      type: "Recurrency",
    },
    {
      name: "transaction_1",
      type: "transaction1",
    },
    {
      name: "transaction_2",
      type: "transaction2",
    },
    {
      name: "transaction_3",
      type: "transaction3",
    },
  ],
  Meta: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "builder",
      type: "address",
    },
    {
      name: "selector",
      type: "bytes4",
    },
    {
      name: "version",
      type: "bytes3",
    },
    {
      name: "random_id",
      type: "bytes3",
    },
    {
      name: "eip712",
      type: "bool",
    },
    {
      name: "auth_enabled",
      type: "bool",
    },
  ],
  Limits: [
    {
      name: "valid_from",
      type: "uint40",
    },
    {
      name: "expires_at",
      type: "uint40",
    },
    {
      name: "gas_price_limit",
      type: "uint64",
    },
    {
      name: "purgeable",
      type: "bool",
    },
    {
      name: "blockable",
      type: "bool",
    },
  ],
  Recurrency: [
    {
      name: "max_repeats",
      type: "uint16",
    },
    {
      name: "chill_time",
      type: "uint32",
    },
    {
      name: "accumetable",
      type: "bool",
    },
  ],
  transaction1: [
    {
      name: "call",
      type: "Call",
    },
    {
      name: "from",
      type: "address",
    },
    {
      name: "to",
      type: "address",
    },
    {
      name: "amount",
      type: "uint256",
    },
  ],
  transaction2: [
    {
      name: "call",
      type: "Call",
    },
    {
      name: "from",
      type: "address",
    },
    {
      name: "to",
      type: "address",
    },
    {
      name: "tokenId",
      type: "uint256",
    },
  ],
  transaction3: [
    {
      name: "call",
      type: "Call",
    },
    {
      name: "data",
      type: "Struct1",
    },
  ],
  Struct1: [
    {
      name: "to",
      type: "address",
    },
    {
      name: "value",
      type: "uint256",
    },
    {
      name: "value2",
      type: "Struct2",
    },
  ],
  Struct2: [
    {
      name: "to",
      type: "address",
    },
  ],
  Call: [
    {
      name: "call_index",
      type: "uint16",
    },
    {
      name: "payer_index",
      type: "uint16",
    },
    {
      name: "call_type",
      type: "string",
    },
    {
      name: "from",
      type: "address",
    },
    {
      name: "to",
      type: "address",
    },
    {
      name: "to_ens",
      type: "string",
    },
    {
      name: "eth_value",
      type: "uint256",
    },
    {
      name: "gas_limit",
      type: "uint32",
    },
    {
      name: "permissions",
      type: "uint16",
    },
    {
      name: "flow_control",
      type: "string",
    },
    {
      name: "returned_false_means_fail",
      type: "bool",
    },
    {
      name: "jump_on_success",
      type: "uint16",
    },
    {
      name: "jump_on_fail",
      type: "uint16",
    },
    {
      name: "method_interface",
      type: "string",
    },
  ],
};

dotenv.config();
const key = process.env.PRIVATE_KEY as string;

async function main() {
  const FCT = new BatchMultiSigCall();

  FCT.importFCT(FCTData);

  // const exportFCT = FCT.exportFCT();

  console.log(util.inspect(FCT.calls, false, null, true));

  // const signature = "(address,uint256,(address))";
  // // const signature = "address,uint256,address";
  // const dataTypes = typedData.types[`transaction3`].slice(1);
  // const signatureToTypes = (signature: string, types: { name: string; type: string }[]): any => {
  //   // Check if ( is the first character
  //   const first = signature[0];
  //   if (first === "(") {
  //     // Remove first and last character
  //     signature = signature.slice(1, -1);
  //     const type = typesObject[types[0].type as keyof typeof typesObject];
  //     return [signatureToTypes(signature, type)];
  //   }
  //   // Check if , is in the string
  //   const comma = signature.indexOf(",");
  //   if (comma !== -1) {
  //     // Split first and rest
  //     const first = signature.slice(0, comma);
  //     const rest = signature.slice(comma + 1);
  //     const name = types[0].name;
  //     return [`${first} ${name}`, ...signatureToTypes(rest, types.slice(1))];
  //   }
  //   return [`${signature} ${types[0].name}`];
  // };
  // const array = signatureToTypes(signature, dataTypes);
  // // Convert [[ 'address to', 'uint256 value', [ 'address to' ]]]
  // // to ["tuple(address to, uint256 value, tuple(address to))"]
  // const convertTypes = (types: any[], typesData: { name: string; type: string }[]): any => {
  //   return types.map((type, index) => {
  //     if (Array.isArray(type)) {
  //       const name = typesData[index].name;
  //       const typesDataArray = typesObject[typesData[index].type as keyof typeof typesObject];
  //       return `tuple(${convertTypes(type, typesDataArray)}) ${name}`;
  //     }
  //     return type;
  //   });
  // };
  // console.log(convertTypes(array, dataTypes));
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
