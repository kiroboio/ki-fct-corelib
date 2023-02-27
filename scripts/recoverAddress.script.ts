import { utils } from "../src";

const FCT = {
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
      verifyingContract: "0x087550a787B2720AAC06351065afC1F413D82572",
      salt: "0x01005fc59cf4781ce0b30000087550a787b2720aac06351065afc1f413d82572",
    },
    message: {
      meta: {
        name: "🔥Untitled",
        builder: "0x0000000000000000000000000000000000000000",
        selector: "0xf6407ddd",
        version: "0x010101",
        random_id: "0x8db96a",
        eip712: true,
        auth_enabled: true,
      },
      limits: {
        valid_from: "1677362400",
        expires_at: "1678053599",
        gas_price_limit: "2000000000",
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
  sessionId: "0x8db96a0001010100000000000000640510df0063fa84e000000000773594000c",
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
      r: "0x85febcdbc476f8df3402c2822c8dfce5e09eec44b0c36d88a3f3c67168465b36",
      s: "0x3097d4068fa144b5f3122ecc861ddf5a5ecbb29853132719a3db8b7c4422553f",
      _vs: "0xb097d4068fa144b5f3122ecc861ddf5a5ecbb29853132719a3db8b7c4422553f",
      recoveryParam: 1,
      v: 28,
      yParityAndS: "0xb097d4068fa144b5f3122ecc861ddf5a5ecbb29853132719a3db8b7c4422553f",
      compact:
        "0x85febcdbc476f8df3402c2822c8dfce5e09eec44b0c36d88a3f3c67168465b36b097d4068fa144b5f3122ecc861ddf5a5ecbb29853132719a3db8b7c4422553f",
    },
    {
      r: "0x8e27d1c1188402016c766b77c59cdfd0aa859bec181b6a4dcf80a7c48fa7d1e0",
      s: "0x18a1c9c665d8e1be27f0ea1b89b7120e1aeada49ec8d6f8653449abbe248f96b",
      v: 27,
    },
  ],
  computed: [],
};

async function main() {
  const address = utils.recoverAddressFromEIP712(FCT.typedData, FCT.signatures[0]);
  const address2 = utils.recoverAddressFromEIP712(FCT.typedData, FCT.signatures[1]);
  console.log(address, address2);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
