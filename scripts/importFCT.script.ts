import * as dotenv from "dotenv";
import util from "util";

import { BatchMultiSigCall } from "../src";
// import { BatchMultiSigCall } from "../src";

const FCTFailing = {
  typedData: {
    types: {
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
          name: "transaction_1",
          type: "transaction1",
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
      transaction1: [
        {
          name: "call",
          type: "Call",
        },
        {
          name: "recipient",
          type: "address",
        },
        {
          name: "amount",
          type: "uint256",
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
    },
    primaryType: "BatchMultiSigCall",
    domain: {
      name: "FCT Controller",
      version: "1",
      chainId: 5,
      verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
      salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
    },
    message: {
      meta: {
        name: "🔥Untitled",
        builder: "0x0000000000000000000000000000000000000000",
        selector: "0xf6407ddd",
        version: "0x010101",
        random_id: "0xc5c982",
        eip712: true,
        auth_enabled: false,
      },
      limits: {
        valid_from: "1677448800",
        expires_at: "1678139999",
        gas_price_limit: "11523350748",
        purgeable: false,
        blockable: true,
      },
      transaction_1: {
        call: {
          call_index: 1,
          payer_index: 1,
          call_type: "action",
          from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
          to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
          to_ens: "",
          eth_value: "0",
          gas_limit: "114824",
          permissions: 0,
          flow_control: "stop on success, revert on fail",
          returned_false_means_fail: true,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "transfer(address,uint256)",
        },
        recipient: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
        amount: "1000000000000000000",
      },
    },
  },
  builder: "0x0000000000000000000000000000000000000000",
  typeHash: "0x4788192ebf31e69ab2b0afa2484d5b285235311fd1feadf4d2714ef859ffc723",
  sessionId: "0xc5c98200010101000000000000006406625f0063fbd66000000002aed860dc0c",
  nameHash: "0xf41ad051fb56ed68686fda16fde3f9e4e51449a430e0b95f72636251d16683d7",
  mcall: [
    {
      typeHash: "0xed53c5a7dcb3019f57626a3d1c881f32aea4a03a4f5be98685dd2f2f1cdd02c0",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b",
      value: "0",
      callId: "0x0000000000000000000000000000000000000600000000000100010001c08804",
      from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
      to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
      data: "0x000000000000000000000000e911180acde75bfbacfc8bbfd484768b6aa3bd300000000000000000000000000000000000000000000000000de0b6b3a7640000",
      types: [],
      typedHashes: [],
    },
  ],
  variables: [],
  externalSigners: [],
  signatures: [
    {
      r: "0x6ac5847a4d0f52f4bd443f5a3c4bb7e0ca3677c70dd160b11680abe24747ee86",
      s: "0x6eb5a27f4e4e23cb4692e22b0ac7af8cd8c6a9ce829f275fc166a18adfd1193b",
      _vs: "0xeeb5a27f4e4e23cb4692e22b0ac7af8cd8c6a9ce829f275fc166a18adfd1193b",
      recoveryParam: 1,
      v: 28,
      yParityAndS: "0xeeb5a27f4e4e23cb4692e22b0ac7af8cd8c6a9ce829f275fc166a18adfd1193b",
      compact:
        "0x6ac5847a4d0f52f4bd443f5a3c4bb7e0ca3677c70dd160b11680abe24747ee86eeb5a27f4e4e23cb4692e22b0ac7af8cd8c6a9ce829f275fc166a18adfd1193b",
    },
  ],
  computed: [],
};

dotenv.config();

async function main() {
  const FCT = new BatchMultiSigCall();

  FCT.importFCT(FCTFailing);

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
