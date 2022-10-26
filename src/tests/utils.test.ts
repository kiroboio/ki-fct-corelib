import utils from "../utils";

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
          name: "owner",
          type: "address",
        },
      ],
      transaction2: [
        {
          name: "call",
          type: "Call",
        },
        {
          name: "value1",
          type: "uint256",
        },
        {
          name: "value2",
          type: "uint256",
        },
      ],
      transaction3: [
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
          name: "view_only",
          type: "bool",
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
      verifyingContract: "0xE215Fe5f574593A034c7E6e9BE280A254D02F4dd",
      salt: "0x0100eaec4f8a226d40f60000e215fe5f574593a034c7e6e9be280a254d02f4dd",
    },
    message: {
      meta: {
        name: "",
        builder: "0x0000000000000000000000000000000000000000",
        selector: "0xb91c650e",
        version: "0x010101",
        random_id: "0x5c396b",
        eip712: true,
      },
      limits: {
        valid_from: "1666772849",
        expires_at: "1667640449",
        gas_price_limit: "100000000000",
        purgeable: false,
        blockable: true,
      },
      recurrency: {
        max_repeats: "1000",
        chill_time: "1",
        accumetable: true,
      },
      transaction_1: {
        call: {
          call_index: 1,
          payer_index: 1,
          from: "0x9650578EBd1b08f98Af81a84372ECE4B448d7526",
          to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
          to_ens: "",
          eth_value: "0",
          gas_limit: 0,
          view_only: true,
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "balanceOf(address)",
        },
        owner: "0x9650578EBd1b08f98Af81a84372ECE4B448d7526",
      },
      transaction_2: {
        call: {
          call_index: 2,
          payer_index: 2,
          from: "0x9650578EBd1b08f98Af81a84372ECE4B448d7526",
          to: "0x1716898d72BE098F4828B435a3918cBFda562Efc",
          to_ens: "",
          eth_value: "0",
          gas_limit: 0,
          view_only: true,
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "greaterThan(uint256,uint256)",
        },
        value1: "0xFD00000000000000000000000000000000000001",
        value2: "10000000000000000000",
      },
      transaction_3: {
        call: {
          call_index: 3,
          payer_index: 3,
          from: "0x9650578EBd1b08f98Af81a84372ECE4B448d7526",
          to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
          to_ens: "",
          eth_value: "0",
          gas_limit: 0,
          view_only: false,
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "transfer(address,uint256)",
        },
        recipient: "0x62e3A53A947D34C4DdCD67B49fAdc30b643e2586",
        amount: "6000000000000000000",
      },
    },
  },
  builder: "0x0000000000000000000000000000000000000000",
  typeHash: "0x36765bd19b0e0dbe642f489e356088cf44829e9aa579be0afaf25053c54c9dff",
  sessionId: "0x5c396b0001010103e8000000010063662c81006358ef71000000174876e8000d",
  nameHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
  mcall: [
    {
      typeHash: "0xad5462360f54de994d2128f030e4f6a95d4f1d0ad88dc7ff6e34399b23dbaa08",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0x70a08231b98ef4ca268c9cc3f6b4590e4bfec28280db06bb5d45e689f2a360be",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000100010000000001",
      from: "0x9650578EBd1b08f98Af81a84372ECE4B448d7526",
      to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
      data: "0x0000000000000000000000009650578ebd1b08f98af81a84372ece4b448d7526",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0xd0b81b368ecce289ea62e6b8ff8e2cb2e363fa019bafc0c357c7ad463926665d",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0x48f24ceb1121cd7ee6eb6043b6846778e52613b536a581a2d400f838c2f3557c",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000200020000000001",
      from: "0x9650578EBd1b08f98Af81a84372ECE4B448d7526",
      to: "0x1716898d72BE098F4828B435a3918cBFda562Efc",
      data: "0x000000000000000000000000fd000000000000000000000000000000000000010000000000000000000000000000000000000000000000008ac7230489e80000",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0x4826e4979224e60013e06e605e916f0060b4fef093465d50b9c86ae02daca33a",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000300030000000000",
      from: "0x9650578EBd1b08f98Af81a84372ECE4B448d7526",
      to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
      data: "0x00000000000000000000000062e3a53a947d34c4ddcd67b49fadc30b643e258600000000000000000000000000000000000000000000000053444835ec580000",
      types: [],
      typedHashes: [],
    },
  ],
  signatures: [
    "0x69cac892f84ee5352ad6f7861182e54516f359a3bb46dc24cbd828b0594b34bc08e9a90ecb07004d5ea2d847a12f708db574c0475d12c64c163770a6d0ff5cb21b",
  ],
  variables: [],
  externalSigners: [],
};

describe("Test utils", () => {
  it("Should get address from signature", async () => {
    const address = utils.recoverAddressFromEIP712(FCT.typedData, FCT.signatures[0]);

    console.log("address", address);
    console.log("address should be", "0x62e3A53A947D34C4DdCD67B49fAdc30b643e2586");
  });

  it("Should get message hash", async () => {
    const hash = utils.getFCTMessageHash(FCT.typedData);
    console.log(hash);
  });
});
