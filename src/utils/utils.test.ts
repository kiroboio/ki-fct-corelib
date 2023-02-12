import { expect } from "chai";

import { ethers, utils } from "../index";

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
        {
          name: "transaction_4",
          type: "transaction4",
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
          name: "amount",
          type: "uint256",
        },
        {
          name: "method",
          type: "string",
        },
        {
          name: "path",
          type: "address[]",
        },
      ],
      transaction2: [
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
      transaction4: [
        {
          name: "call",
          type: "Call",
        },
        {
          name: "amount",
          type: "uint256",
        },
        {
          name: "method",
          type: "string",
        },
        {
          name: "path",
          type: "address[]",
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
      verifyingContract: "0xc86A8f32feDB6D05b9153049aA596cF5C1621d45",
      salt: "0x0100e421e2e61b1b9a580000c86a8f32fedb6d05b9153049aa596cf5c1621d45",
    },
    message: {
      meta: {
        name: "",
        builder: "0x0000000000000000000000000000000000000000",
        selector: "0x2409a934",
        version: "0x010101",
        random_id: "0x03d61d",
        eip712: true,
      },
      limits: {
        valid_from: "1673533606",
        expires_at: "88073533606",
        gas_price_limit: "3000000000",
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
          call_type: "action",
          from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
          to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
          to_ens: "",
          eth_value: "0",
          gas_limit: "0",
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          returned_false_means_fail: false,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "swap_noSlippageProtection(uint256,bytes32,address[])",
        },
        amount: "1000000",
        method: "swap <amount> ETH for <X> Tokens",
        path: ["0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6", "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"],
      },
      transaction_2: {
        call: {
          call_index: 2,
          payer_index: 2,
          call_type: "action",
          from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
          to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
          to_ens: "",
          eth_value: "0",
          gas_limit: "64824",
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          returned_false_means_fail: true,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "transfer(address,uint256)",
        },
        recipient: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
        amount: "1000000000000000000",
      },
      transaction_3: {
        call: {
          call_index: 3,
          payer_index: 3,
          call_type: "action",
          from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
          to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
          to_ens: "",
          eth_value: "0",
          gas_limit: "64824",
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          returned_false_means_fail: true,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "transfer(address,uint256)",
        },
        recipient: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
        amount: "1000000000000000000",
      },
      transaction_4: {
        call: {
          call_index: 4,
          payer_index: 4,
          call_type: "library",
          from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
          to: "0x4186dA7567697B155BC9281eF409ff3eCc6bB0dC",
          to_ens: "@lib:uniswap_v2",
          eth_value: "0",
          gas_limit: "400000",
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          returned_false_means_fail: false,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "swap_noSlippageProtection(uint256,bytes32,address[])",
        },
        amount: "1000000",
        method: "0x879b548aa5cfb2c501936de860db8fbbfd55fc8bfb83436d8285c2ff4426b364",
        path: ["0xba232b47a7ddfccc221916cf08da03a4973d3a1d", "0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557"],
      },
    },
  },
  builder: "0x0000000000000000000000000000000000000000",
  typeHash: "0x8c09648ab9eb65c54a5d9bcf599d5d7832f83d09424915db94b0e594ee1e7eee",
  sessionId: "0x03d61d0001010103e80000000114819778a60063c018a600000000b2d05e000d",
  nameHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
  mcall: [
    {
      typeHash: "0xc0f2bc18d08aca5ca4de62820a15c580d94519cd311e4f78e8110f0165b3da8f",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xba619610583d7cd8206b41ecd63f30575006cf2516356822d6f70c67bdf5f3cb",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000100010000000000",
      from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
      to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
      data: "0x00000000000000000000000000000000000000000000000000000000000f4240466cc669f6960e4421e91695071448f897ff8b24896d7be50c3dfd35763c11bc00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000002000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d60000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984",
      types: [1000, 1000, 4000, 1000],
      typedHashes: [],
    },
    {
      typeHash: "0x134edcea6d6ba5f3aa0f66cb00b16474743aba840ba2322417063e21816b83f5",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000200020000fd3804",
      from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
      to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
      data: "0x000000000000000000000000e911180acde75bfbacfc8bbfd484768b6aa3bd300000000000000000000000000000000000000000000000000de0b6b3a7640000",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0x4355be25898c7015477399225af908fffa64d0f7f256cfa9d919c40c7d2aa2b9",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000300030000fd3804",
      from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
      to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
      data: "0x000000000000000000000000e911180acde75bfbacfc8bbfd484768b6aa3bd300000000000000000000000000000000000000000000000000de0b6b3a7640000",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0x60c949f9012634e61a6d389085bb26f6a457e60d6f292bddd47cebc29be6fb85",
      ensHash: "0x7ca009b601db9e76f36541b80a69739c7ec25e0965b26d7682509a2fcb7dcccb",
      functionSignature: "0xba619610583d7cd8206b41ecd63f30575006cf2516356822d6f70c67bdf5f3cb",
      value: "0",
      callId: "0x00000000000000000000000000000000000000000000000004000400061a8022",
      from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
      to: "0x4186dA7567697B155BC9281eF409ff3eCc6bB0dC",
      data: "0x00000000000000000000000000000000000000000000000000000000000f424089f1215ae7bbd066a065ee077f63f2de1db4370f1ce7b68c80bb751a65551a3d00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000002000000000000000000000000ba232b47a7ddfccc221916cf08da03a4973d3a1d0000000000000000000000002f3a40a3db8a7e3d09b0adfefbce4f6f81927557",
      types: [1000, 1000, 4000, 1000],
      typedHashes: [],
    },
  ],
  variables: [],
  externalSigners: [],
  computed: [],
  signatures: [
    {
      r: "0x6e4958c2d8fdfa85a2a04a8718cff326f23868cd4abec2e024e70f8980c75fd6",
      s: "0x5753257998932a169b818f3c34ebc876e3c628f9fd11b063b430f05102819596",
      _vs: "0xd753257998932a169b818f3c34ebc876e3c628f9fd11b063b430f05102819596",
      recoveryParam: 1,
      v: 28,
      yParityAndS: "0xd753257998932a169b818f3c34ebc876e3c628f9fd11b063b430f05102819596",
      compact:
        "0x6e4958c2d8fdfa85a2a04a8718cff326f23868cd4abec2e024e70f8980c75fd6d753257998932a169b818f3c34ebc876e3c628f9fd11b063b430f05102819596",
    },
  ],
};

const ACTIVATOR = "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30";

describe("Utility functions", () => {
  describe("FCT Utility functions", () => {
    it("Should recover address from EIP712", async () => {
      const address = utils.recoverAddressFromEIP712(FCT.typedData, FCT.signatures[0]);

      expect(ethers.utils.getAddress(address as string)).to.eq(ethers.utils.getAddress(ACTIVATOR));
    });

    it("Should get FCT Message hash", () => {
      const hash = utils.getFCTMessageHash(FCT.typedData);

      expect(hash).to.be.a("string");
    });

    it("Should validate FCT", () => {
      const validateFunctions = utils.validateFCT(FCT);

      expect(validateFunctions).to.be.a("object");
    });

    it("Should get variables as bytes32", () => {
      const randomAddress = "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30";
      const randomValue = "1000000000000000000";

      const variables = utils.getVariablesAsBytes32([randomAddress, randomValue]);

      const result = [
        "0x000000000000000000000000E911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
        "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000",
      ];

      expect(variables).to.deep.eq(result);
    });
  });
  describe("Fetch functions", () => {
    it("Should fetch current approvals", async () => {
      const approvals = await utils.fetchCurrentApprovals({
        rpcUrl: "https://eth-goerli.public.blastapi.io",
        data: [
          {
            token: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
            from: "0xB252A554217d614Fb2968cf8f87b02e3D9DBd63C",
            spender: "0x9034f5225C76B09750c0dA9Ef5B4BBaf0d455A1C",
          },
        ],
      });

      expect(approvals).to.be.a("array");

      expect(approvals[0].from).to.eq("0xB252A554217d614Fb2968cf8f87b02e3D9DBd63C");
      expect(approvals[0].spender).to.eq("0x9034f5225C76B09750c0dA9Ef5B4BBaf0d455A1C");
      expect(approvals[0].token).to.eq("0xba232b47a7ddfccc221916cf08da03a4973d3a1d");
    });
  });
  describe("Gas functions", () => {
    it("Should get gas prices", async () => {
      const gasPrices = await utils.getGasPrices({
        rpcUrl: "https://eth-goerli.public.blastapi.io",
      });

      expect(gasPrices).to.be.a("object");
      expect(gasPrices.slow.maxFeePerGas).to.be.a("number");
      expect(gasPrices.slow.maxPriorityFeePerGas).to.be.a("number");

      expect(gasPrices.average.maxFeePerGas).to.be.a("number");
      expect(gasPrices.average.maxPriorityFeePerGas).to.be.a("number");

      expect(gasPrices.fast.maxFeePerGas).to.be.a("number");
      expect(gasPrices.fast.maxPriorityFeePerGas).to.be.a("number");

      expect(gasPrices.fastest.maxFeePerGas).to.be.a("number");
      expect(gasPrices.fastest.maxPriorityFeePerGas).to.be.a("number");
    });

    it("Should get KIRO cost of FCT", async () => {
      const fctCost = utils.getKIROPayment({
        fct: FCT,
        kiroPriceInETH: "38270821632831754769812",
        gasPrice: 1580000096,
        gas: 462109,
      });

      // expect(fctCost.amount).to.eq("43.29359365495305");
      expect(fctCost.vault).to.eq("0x03357338Ea477FF139170cf85C9A4063dFc03FC9");
    });
  });
});
