import * as dotenv from "dotenv";

import FCTData from "../FCT.json";
// import { BatchMultiSigCall } from "../src";

const encoded =
  "0x0000000000000000000000009650578ebd1b08f98af81a84372ece4b448d7526000000000000000000000000fc00000000000000000000000000000000000002000000000000000000000000fc00000000000000000000000000000000000003";

const typedData = FCTData.typedData;

const types = {
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
  const signature = "(address,uint256,(address))";
  const dataTypes = typedData.types[`transaction3`].slice(1);

  const signatureToTypes = (signature: string, types: { name: string; type: string }[]) => {
    // Check what is first ( or ,
    const first = signature[0];
    const rest = signature.slice(1);
    if (first === "(") {
      const [type, restSignature] = rest.split(")");
      const restTypes = signatureToTypes(restSignature, types);
      return [type, ...restTypes];
    }
  };

  console.log(signatureToTypes(signature, dataTypes));

  // const decoded = ethers.utils.defaultAbiCoder.decode(["tuple(address,uint256,tuple(address))"], encoded);

  // console.log(decoded);
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
