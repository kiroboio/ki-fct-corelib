import { expect } from "chai";

import { utils } from "../index";
import { FetchUtility } from "./fetch";

const FCTData = {
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
        name: "",
        builder: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
        selector: "0xf6407ddd",
        version: "0x010101",
        random_id: "0xbea443",
        eip712: true,
        auth_enabled: true,
      },
      limits: {
        valid_from: "1677418020",
        expires_at: "88077418020",
        gas_price_limit: "20000000000",
        purgeable: false,
        blockable: true,
      },
      recurrency: {
        max_repeats: "500",
        chill_time: "0",
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
          gas_limit: "130178",
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          returned_false_means_fail: true,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "transferFrom(address,address,uint256)",
        },
        from: "0x62e3a53a947d34c4ddcd67b49fadc30b643e2586",
        to: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
        amount: "1",
      },
      transaction_2: {
        call: {
          call_index: 2,
          payer_index: 2,
          call_type: "action",
          from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
          to: "0x39Ec448b891c476e166b3C3242A90830DB556661",
          to_ens: "",
          eth_value: "0",
          gas_limit: "181230",
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          returned_false_means_fail: false,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "safeTransferFrom(address,address,uint256)",
        },
        from: "0xDF9c06D1A927D8945fA5b05840A3A385Eaa14D98",
        to: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
        tokenId: "1",
      },
      transaction_3: {
        call: {
          call_index: 3,
          payer_index: 3,
          call_type: "action",
          from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
          to: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
          to_ens: "",
          eth_value: "0",
          gas_limit: "0",
          permissions: 0,
          flow_control: "continue on success, revert on fail",
          returned_false_means_fail: false,
          jump_on_success: 0,
          jump_on_fail: 0,
          method_interface: "transfer((address,uint256,(address)))",
        },
        data: {
          to: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
          value: "0xFC00000000000000000000000000000000000002",
          value2: {
            to: "0xFC00000000000000000000000000000000000003",
          },
        },
      },
    },
  },
  builder: "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30",
  typeHash: "0x0d8fc0fedb678095d9cf837393403827c1f760b4492146b14ddbd585abfc2410",
  sessionId: "0xbea4430001010101f4000000001481d2be240063fb5e2400000004a817c8001d",
  nameHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
  mcall: [
    {
      typeHash: "0xf4dc87237688710b149e4133d7d3777db02a309dbe4b4f196619c5cd6a2394c0",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0x23b872dd7302113369cda2901243429419bec145408fa8b352b3dd92b66c680b",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000100010001fc8204",
      from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
      to: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
      data: "0x00000000000000000000000062e3a53a947d34c4ddcd67b49fadc30b643e25860000000000000000000000009650578ebd1b08f98af81a84372ece4b448d75260000000000000000000000000000000000000000000000000000000000000001",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0x905eadcb1bb154e904da3fae408cf56b5659637ae18477e1eb50a5305e628595",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0x42842e0eb38857a7775b4e7364b2775df7325074d088e7fb39590cd6281184ed",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000200020002c3ee00",
      from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
      to: "0x39Ec448b891c476e166b3C3242A90830DB556661",
      data: "0x000000000000000000000000df9c06d1a927d8945fa5b05840a3a385eaa14d980000000000000000000000009650578ebd1b08f98af81a84372ece4b448d75260000000000000000000000000000000000000000000000000000000000000001",
      types: [],
      typedHashes: [],
    },
    {
      typeHash: "0xf1c7d34003cd353f9da18bbab9ba61f9db466033599e5cc51156d2211825524a",
      ensHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      functionSignature: "0x10e529c8e597c140759ad6bfabc14c1256c95043704530f3f8d59455eacdcfb2",
      value: "0",
      callId: "0x0000000000000000000000000000000000000000000000000300030000000000",
      from: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
      to: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
      data: "0x0000000000000000000000009650578ebd1b08f98af81a84372ece4b448d7526000000000000000000000000fc00000000000000000000000000000000000002000000000000000000000000fc00000000000000000000000000000000000003",
      types: [3, 1000, 1000, 1, 1000],
      typedHashes: [
        "0x6a18c09429b5825b2db19fe0b022c94d9511ad79d6e07b111101fa69a06ba5ee",
        "0x687a1f96bfb73a26708451086838e7f7e4a7a7ac17aebf96f887006d26dca612",
      ],
    },
  ],
  variables: [],
  externalSigners: [],
  signatures: [
    {
      r: "0xb6d0f5333029817d9d18cb258d764047ef9feffc8f019f0066eae9695182db2f",
      s: "0x40633a9ac1364f9aee46a3adf7e4813e776a6dde844410b51c3cafb9a17d772f",
      _vs: "0x40633a9ac1364f9aee46a3adf7e4813e776a6dde844410b51c3cafb9a17d772f",
      recoveryParam: 0,
      v: 27,
      yParityAndS: "0x40633a9ac1364f9aee46a3adf7e4813e776a6dde844410b51c3cafb9a17d772f",
      compact:
        "0xb6d0f5333029817d9d18cb258d764047ef9feffc8f019f006 6eae9695182db2f40633a9ac1364f9aee46a3adf7e4813e776a6dde844410b51c3cafb9a17d772f",
    },
  ],
  computed: [],
};

const ACTIVATOR = "0xE911180AcDe75bFBaCFc8BbFD484768b6aA3bd30";

describe("Utility functions", () => {
  describe("Fetch functions", () => {
    const fetch = new FetchUtility({
      rpcUrl: "https://eth-goerli.public.blastapi.io",
      chainId: 5,
    });

    it("Should fetch current approvals", async () => {
      const approvals = await fetch.fetchCurrentApprovals([
        {
          token: "0xba232b47a7ddfccc221916cf08da03a4973d3a1d",
          method: "approve",
          from: "0x62e3a53a947d34c4ddcd67b49fadc30b643e2586",
          protocol: "ERC20",
          params: {
            spender: "0x03357338Ea477FF139170cf85C9A4063dFc03FC9",
            amount: "1",
          },
        },
        {
          token: "0x39Ec448b891c476e166b3C3242A90830DB556661",
          method: "approve",
          from: "0xDF9c06D1A927D8945fA5b05840A3A385Eaa14D98",
          protocol: "ERC721",
          params: {
            spender: "0x9650578ebd1b08f98af81a84372ece4b448d7526",
            tokenId: "1",
          },
        },
      ]);

      const approval = approvals[0] as {
        protocol: "ERC20";
        method: "approve";
        params: {
          spender: string;
          amount: string;
        };
        from: string;
        token: string;
      };

      expect(approval.from).to.eq("0x62e3a53a947d34c4ddcd67b49fadc30b643e2586");
      expect(approval.params.spender).to.eq("0x03357338Ea477FF139170cf85C9A4063dFc03FC9");
    });
  });

  it("Should get gas prices", async () => {
    const gasPrices = await utils.getGasPrices({
      rpcUrl: "https://eth-goerli.public.blastapi.io",
      chainId: 5,
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
});
