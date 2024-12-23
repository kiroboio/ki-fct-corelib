import { AaveV2, ERC20, Magic, SecureStorage } from "@kiroboio/fct-plugins";
import { expect } from "chai";
import { ethers } from "ethers";
import { beforeEach, describe } from "mocha";

import { variables } from "../..";
import { Flow } from "../../constants";
import { flows } from "../../constants/flows";
import { getDate } from "../../helpers";
import { Interfaces } from "../../helpers/Interfaces";
import { CallOptions } from "../../types";
import { CallID } from "../classes";
import { BatchMultiSigCall } from "../index";
import { IMSCallInput, IRequiredApproval } from "../types";
import { getVersionClass } from "../versions/getVersion";
import { FCTCreateCallErrors } from "./call.test";
import { FCTOptionsErrors } from "./options.test";
// Create a function that creates a random address
const createRandomAddress = () => ethers.Wallet.createRandom().address;

describe("BatchMultiSigCall", () => {
  let batchMultiSigCall: BatchMultiSigCall;
  let FCT: BatchMultiSigCall;

  beforeEach(() => {
    batchMultiSigCall = new BatchMultiSigCall({
      chainId: "1",
    });
  });

  describe("Settings", () => {
    FCTOptionsErrors();

    it("Should set settings", async () => {
      const expiresAt = getDate(1);

      const validSettings = {
        maxGasPrice: "100000000000",
        expiresAt,
        purgeable: true,
        blockable: true,
        builder: {
          address: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        },
      };

      expect(batchMultiSigCall.setOptions(validSettings)).to.be.an("object");
      expect(batchMultiSigCall.options.builder.address).to.be.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
      expect(batchMultiSigCall.options.maxGasPrice).to.be.eq("100000000000");
      expect(batchMultiSigCall.options.expiresAt).to.be.eq(expiresAt);
      expect(batchMultiSigCall.options.purgeable).to.be.eq(true);
      expect(batchMultiSigCall.options.blockable).to.be.eq(true);
    });

    it("Should expect chainId to be changed", () => {
      batchMultiSigCall.changeChainId("1");
      expect(batchMultiSigCall.chainId).to.be.eq("1");
    });

    it("Should set call defaults", () => {
      const from = createRandomAddress();

      const defaults = batchMultiSigCall.setCallDefaults({
        from,
      });

      expect(defaults).to.be.an("object");
      expect(defaults.from).to.be.eq(from);
    });
  });

  describe("Calls", () => {
    FCTCreateCallErrors();
  });

  describe("Flow", () => {
    const from = createRandomAddress();
    const to = createRandomAddress();

    const getFlowFromCallID = (callID: string) => {
      const callId = CallID.parse(callID);
      return callId.options.flow;
    };

    // Regular ETH Transfer
    const call: IMSCallInput = {
      to,
      from,
      value: ethers.utils.parseEther("1").toString(),
    };

    const getFCT = async (options: CallOptions) => {
      const callWithOptions = {
        ...call,
        options,
      };

      await batchMultiSigCall.create(callWithOptions);
      const FCT = batchMultiSigCall.exportFCT();

      return {
        FCT,
        callID: getFlowFromCallID(FCT.mcall[0].callId),
      };
    };

    it("Should create a call with OK_CONT_FAIL_REVERT", async () => {
      const flow = flows.OK_CONT_FAIL_REVERT;

      const { FCT, callID } = await getFCT({
        flow: Flow.OK_CONT_FAIL_REVERT,
      });

      expect(FCT.typedData.message["transaction_1"].call.flow_control).to.eq(flow.text);
      expect(callID).to.eq(Flow.OK_CONT_FAIL_REVERT);
    });

    it("Should create a call with OK_CONT_FAIL_STOP", async () => {
      const flow = flows.OK_CONT_FAIL_STOP;

      const { FCT, callID } = await getFCT({
        flow: Flow.OK_CONT_FAIL_STOP,
      });

      expect(FCT.typedData.message["transaction_1"].call.flow_control).to.eq(flow.text);
      expect(callID).to.eq(Flow.OK_CONT_FAIL_STOP);
    });

    it("Should create a call with OK_CONT_FAIL_CONT", async () => {
      const flow = flows.OK_CONT_FAIL_CONT;

      const { FCT, callID } = await getFCT({
        flow: Flow.OK_CONT_FAIL_CONT,
      });

      expect(FCT.typedData.message["transaction_1"].call.flow_control).to.eq(flow.text);
      expect(callID).to.eq(Flow.OK_CONT_FAIL_CONT);
    });

    it("Should create a call with OK_REVERT_FAIL_CONT", async () => {
      const flow = flows.OK_REVERT_FAIL_CONT;

      const { FCT, callID } = await getFCT({
        flow: Flow.OK_REVERT_FAIL_CONT,
      });

      expect(FCT.typedData.message["transaction_1"].call.flow_control).to.eq(flow.text);
      expect(callID).to.eq(Flow.OK_REVERT_FAIL_CONT);
    });

    it("Should create a call with OK_REVERT_FAIL_STOP", async () => {
      const flow = flows.OK_REVERT_FAIL_STOP;

      const { FCT, callID } = await getFCT({
        flow: Flow.OK_REVERT_FAIL_STOP,
      });

      expect(FCT.typedData.message["transaction_1"].call.flow_control).to.eq(flow.text);
      expect(callID).to.eq(Flow.OK_REVERT_FAIL_STOP);
    });

    it("Should create a call with OK_STOP_FAIL_CONT", async () => {
      const flow = flows.OK_STOP_FAIL_CONT;

      const { FCT, callID } = await getFCT({
        flow: Flow.OK_STOP_FAIL_CONT,
      });

      expect(FCT.typedData.message["transaction_1"].call.flow_control).to.eq(flow.text);
      expect(callID).to.eq(Flow.OK_STOP_FAIL_CONT);
    });

    it("Should create a call with OK_STOP_FAIL_REVERT", async () => {
      const flow = flows.OK_STOP_FAIL_REVERT;

      const { FCT, callID } = await getFCT({
        flow: Flow.OK_STOP_FAIL_REVERT,
      });

      expect(FCT.typedData.message["transaction_1"].call.flow_control).to.eq(flow.text);
      expect(callID).to.eq(Flow.OK_STOP_FAIL_REVERT);
    });

    it("Should create a call with OK_STOP_FAIL_STOP", async () => {
      const flow = flows.OK_STOP_FAIL_STOP;

      const { FCT, callID } = await getFCT({
        flow: Flow.OK_STOP_FAIL_STOP,
      });

      expect(FCT.typedData.message["transaction_1"].call.flow_control).to.eq(flow.text);
      expect(callID).to.eq(Flow.OK_STOP_FAIL_STOP);
    });
  });

  describe("Regular FCTs", () => {
    beforeEach(() => {
      FCT = new BatchMultiSigCall({
        chainId: "1",
      });
    });

    it("Should create an FCT with pure method", async () => {
      await FCT.add({
        nodeId: "node1",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        method: "magic",
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        options: {
          usePureMethod: true,
        },
      });

      const FCTExport = FCT.exportFCT();

      expect(FCTExport.typedData.message["transaction_1"].call.method_interface).to.eq("magic");
    });

    it("Should create an FCT with magic plugin", async () => {
      await FCT.add({
        nodeId: "node1",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        plugin: new Magic.actions.Magic({
          chainId: "1",
        }),
      });

      const FCTExport = FCT.exportFCT();

      expect(FCTExport.typedData.message["transaction_1"].call.method_interface).to.eq("magic");
    });

    it("Should create an FCT with messageType params", async () => {
      const params = [
        {
          name: "key",
          type: "bytes32",
          customType: false,
          value: "test",
          messageType: "string",
        },
        {
          name: "message",
          type: "bytes",
          customType: false,
          value: "test",
          messageType: "string",
        },
      ];

      await FCT.add({
        nodeId: "node1",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        method: "magic",
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        params,
      });

      const FCTD = FCT.exportFCT();
      const { typedData } = FCTD;

      expect(typedData.types.transaction1[1]).to.deep.eq({ name: "key", type: "string" });
      expect(typedData.types.transaction1[2]).to.deep.eq({ name: "message", type: "string" });
      expect(typedData.message["transaction_1"].call.method_interface).to.eq("magic(bytes32,bytes)");
      expect(typedData.message["transaction_1"].key).to.eq("test");
      expect(typedData.message["transaction_1"].message).to.eq("test");

      // Test import back
      const FCT2 = BatchMultiSigCall.from(FCTD);

      // Log every call every parameter
      // console.log(FCT2.calls[0].get().params);

      expect(FCT2.calls[0].get().params).to.deep.eq(params);
    });

    it("Should create an FCT with secure storage plugins", async () => {
      const plugin = new SecureStorage.actions.Write_bytes({
        chainId: "1",
        initParams: {
          methodParams: {
            // key: "ethers.utils.hexZeroPad("0x4f631612941F710db646B8290dB097bFB8657dC2", 32),"
            key: "test",
            value: "hello",
          },
        },
      });

      await FCT.add({
        nodeId: "node1",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        plugin: plugin,
      });

      const FCTExport = FCT.exportFCT();

      expect(FCTExport.typedData.message["transaction_1"].call.method_interface).to.eq("write_bytes(bytes32,bytes)");
    });

    it("Should fail to add an FCT with messageTypes that are not supported", async () => {
      const params = [
        {
          name: "key",
          type: "bytes32",
          customType: false,
          value: "test",
          messageType: "uint256",
        },
      ];

      await FCT.add({
        nodeId: "node1",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        method: "magic",
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        params,
      });

      expect(() => {
        FCT.exportFCT();
      }).to.throw(
        `Param ${params[0].name} - Conversion from ${params[0].messageType} to ${params[0].type} is not supported`,
      );
    });

    it("Should export an efficient FCT", async () => {
      await FCT.add({
        nodeId: "node1",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        method: "transfer",
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        params: [
          { name: "recipient", type: "address", value: "0x4f631612941F710db646B8290dB097bFB8657dC2" },
          { name: "amount", type: "uint256", value: "20" },
        ],
      });

      const FCTExport = FCT.exportEfficientFCT();

      expect(FCTExport.mcall.length).to.eq(1);
      expect(FCTExport.computed.length).to.eq(0);
      expect(FCTExport.validations.length).to.eq(0);

      const IERC20 = Interfaces.ERC20;

      const transferCalldata = IERC20.encodeFunctionData("transfer", [
        "0x4f631612941F710db646B8290dB097bFB8657dC2",
        "20",
      ]);

      expect(FCTExport.mcall[0].data.toLowerCase()).to.eq(transferCalldata.toLowerCase());
    });

    it("Should export an FCT with no strict gas limit", async () => {
      await FCT.add({
        nodeId: "node1",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        method: "transfer",
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        params: [
          { name: "recipient", type: "address", value: "0x4f631612941F710db646B8290dB097bFB8657dC2" },
          { name: "amount", type: "uint256", value: "20" },
        ],
        options: {
          gasLimit: "1234123",
        },
      });

      const FCTExport = FCT.exportFCT({ strictGasLimits: false });

      expect(FCTExport.typedData.message["transaction_1"].call.gas_limit).to.eq("0");

      // Make sure that the FCT.calls[0].options.gasLimit is not changed
      expect(FCT.calls[0].options.gasLimit).to.eq("1234123");
    });

    it("Should create the same FCTs but for different version", async () => {
      await FCT.add({
        nodeId: "node1",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        method: "transfer",
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        params: [
          { name: "recipient", type: "address", value: "0x4f631612941F710db646B8290dB097bFB8657dC2" },
          { name: "amount", type: "uint256", value: "20" },
        ],
      });

      const FCTNewVersion = FCT.export();
      expect(FCTNewVersion.typedData.message.limits).to.have.keys([
        "valid_from",
        "expires_at",
        "tx_data_limit",
        "payable_gas_limit",
        "max_payable_gas_price",
        "purgeable",
        "blockable",
      ]);

      // the same limits should not have "gas_price_limit"
      expect(FCTNewVersion.typedData.message.limits).to.not.have.keys(["gas_price_limit"]);

      FCT.version = "0x020103";
      const FCTOldVersion = FCT.export();

      expect(FCTOldVersion.typedData.message.limits).to.have.keys([
        "valid_from",
        "expires_at",
        "gas_price_limit",
        "purgeable",
        "blockable",
      ]);
      // Should not have "payable_gas_limit_in_kilo" and "max_payable_gas_price"
      expect(FCTOldVersion.typedData.message.limits).to.not.have.keys([
        "payable_gas_limit_in_kilo",
        "max_payable_gas_price",
      ]);
    });

    it("Should create an FCT and use a returned value from previous call", async () => {
      const token = createRandomAddress();
      const vault = createRandomAddress();
      const receiver = createRandomAddress();
      const call = await FCT.add({
        nodeId: "balance",
        from: vault,
        method: "balanceOf",
        to: token,
        params: [{ name: "owner", type: "address", value: vault }],
      });

      await FCT.add({
        nodeId: "transfer",
        from: vault,
        method: "transfer",
        to: token,
        params: [
          { name: "recipient", type: "address", value: receiver },
          { name: "amount", type: "uint256", value: call.getOutputVariable(0) },
        ],
      });

      const exportedFCT = FCT.exportFCT();

      expect(exportedFCT.typedData.message["transaction_2"].amount).to.eq(
        "0xFD00000000000000000000000000000000000000000000000000000000200001",
      );
    });

    it.only("Should create an FCT and use variable for int24 value", async () => {
      const token = createRandomAddress();
      const vault = createRandomAddress();

      const call = await FCT.add({
        nodeId: "balance",
        from: vault,
        method: "balanceOf",
        to: token,
        params: [{ name: "owner", type: "address", value: vault }],
      });

      await FCT.add({
        nodeId: "deposit",
        from: vault,
        method: "deposit",
        to: token,
        // params: [{ name: "value", type: "int24", value: call.getOutputVariable(0) }],
        params: [
          {
            name: "tuple",
            type: "tuple",
            customType: true,
            value: [
              { name: "value", type: "int24", value: call.getOutputVariable(0) },
              { name: "amount", type: "uint256", value: "1000000000000000000" },
            ],
          },
        ],
      });

      const exportedFCT = FCT.exportFCT();

      // expect(exportedFCT.typedData.message["transaction_2"].value).to.eq(
      //   "0xFD00000000000000000000000000000000000000000000000000000000200001",
      // );

      const FCT2 = BatchMultiSigCall.from(exportedFCT);
      const payment = FCT2.utils.getPaymentPerPayer({
        ethPriceInKIRO: "1",
      });
      console.log(payment);

      const exportedFCT2 = FCT2.exportFCT();
      console.log(exportedFCT2);
    });
  });

  describe("Complex FCTs", () => {
    beforeEach(() => {
      batchMultiSigCall = new BatchMultiSigCall({
        chainId: "1",
      });
    });
    it("Should create an FCT with payerIndex", async () => {
      const transfer = new ERC20.actions.Transfer({
        chainId: "1",
        initParams: {
          to: "0xfeab457d95d9990b7eb6c943c839258245541754",
          methodParams: {
            amount: "1000000000000000000",
            recipient: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          },
        },
      });

      await batchMultiSigCall.add({
        nodeId: "node1",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        plugin: transfer,
        options: {
          flow: Flow.OK_CONT_FAIL_STOP,
          payerIndex: 0,
        },
      });

      await batchMultiSigCall.add({
        nodeId: "node2",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        plugin: transfer,
        options: {
          flow: Flow.OK_CONT_FAIL_STOP,
        },
      });

      const FCT = batchMultiSigCall.exportFCT();

      expect(FCT.typedData.message["transaction_1"].call.payer_index).to.eq(0);
    });
    it("Should create an FCT with 1 plugin call", async () => {
      const transfer = new ERC20.actions.Transfer({
        chainId: "1",
        initParams: {
          to: "0xfeab457d95d9990b7eb6c943c839258245541754",
          methodParams: {
            amount: "1000000000000000000",
            recipient: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          },
        },
      });

      const call = await batchMultiSigCall.create({
        nodeId: "node1",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        plugin: transfer,
        options: {
          flow: Flow.OK_CONT_FAIL_STOP,
        },
      });

      expect(call).to.be.an("object");

      const FCT = batchMultiSigCall.exportFCT();

      expect(FCT.typedData.message["transaction_1"].recipient).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
      expect(FCT.typedData.message["transaction_1"].amount).to.eq("1000000000000000000");
      expect(FCT.typedData.message["transaction_1"].call.to).to.eq("0xfeab457d95d9990b7eb6c943c839258245541754");
      expect(FCT.typedData.message["transaction_1"].call.flow_control).to.eq("continue on success, stop on fail");
    });
    it("Should create an FCT with 2 plugin calls and 1 non-plugin call", async () => {
      const balanceOf = new ERC20.getters.BalanceOf({
        chainId: "1",
        initParams: {
          to: "0xfeab457d95d9990b7eb6c943c839258245541754",
          methodParams: {
            owner: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          },
        },
      });

      const deposit = new AaveV2.actions.Deposit({
        chainId: "1",
        initParams: {
          to: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
          methodParams: {
            asset: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            amount: "1000000000000000000",
            onBehalfOf: "0x4f631612941F710db646B8290dB097bFB8657dC2",
            referralCode: "0",
          },
        },
      });

      const calls = await batchMultiSigCall.createMultiple([
        {
          nodeId: "node1",
          to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          toENS: "@token.kiro.eth",
          method: "transfer",
          params: [
            { name: "recipient", type: "address", value: "0x4f631612941F710db646B8290dB097bFB8657dC2" },
            { name: "amount", type: "uint256", value: "20" },
          ],
          from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          options: {
            flow: Flow.OK_CONT_FAIL_CONT,
            jumpOnFail: "node3",
          },
        },
        {
          nodeId: "node2",
          plugin: balanceOf,
          from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          options: {
            flow: Flow.OK_CONT_FAIL_CONT,
          },
        },
        {
          nodeId: "node3",
          plugin: deposit,
          from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        },
      ]);

      expect(calls).to.be.an("array");

      const FCT = batchMultiSigCall.exportFCT();

      expect(FCT.typedData.message["transaction_1"].recipient).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
      expect(FCT.typedData.message["transaction_1"].amount).to.eq("20");
      expect(FCT.typedData.message["transaction_1"].call.jump_on_fail).to.eq(1);

      expect(FCT.typedData.message["transaction_2"].owner).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");

      expect(FCT.typedData.message["transaction_3"].asset).to.eq("0x6B175474E89094C44Da98b954EedeAC495271d0F");
      expect(FCT.typedData.message["transaction_3"].amount).to.eq("1000000000000000000");
      expect(FCT.typedData.message["transaction_3"].onBehalfOf).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
    });
    it("Should create an FCT with 3 non-plugin calls", async () => {
      await batchMultiSigCall.createMultiple([
        {
          nodeId: "node1",
          to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          method: "balanceOf",
          params: [{ name: "recipient", type: "address", value: { type: "global", id: "minerAddress" } }],
          options: {
            jumpOnSuccess: "node3",
            jumpOnFail: "node3",
            flow: Flow.OK_STOP_FAIL_CONT,
          },
        },
        {
          nodeId: "node2",
          to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          method: "transfer",
          params: [
            { name: "recipient", type: "address", value: "0x4f631612941F710db646B8290dB097bFB8657dC2" },
            { name: "amount", type: "uint256", value: { type: "output", id: { nodeId: "node1", innerIndex: 0 } } },
          ],
          options: {
            flow: Flow.OK_CONT_FAIL_REVERT,
          },
        },
        {
          nodeId: "node3",
          to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          toENS: "@token.kiro.eth",
          method: "transfer",
          params: [
            { name: "recipient", type: "address", value: "0x4f631612941F710db646B8290dB097bFB8657dC2" },
            { name: "amount", type: "uint256", value: "20" },
          ],
          from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          options: {
            flow: Flow.OK_CONT_FAIL_CONT,
          },
        },
      ]);

      const FCT = batchMultiSigCall.exportFCT();

      expect(FCT).to.be.an("object");

      const sessionId = getVersionClass(batchMultiSigCall).SessionId.parse(FCT.sessionId);
      expect(sessionId).to.be.an("object");

      expect(FCT.typedData.message["transaction_1"].recipient).to.eq("0xFA0A000000000000000000000000000000000000");
      expect(FCT.typedData.message["transaction_1"].call.jump_on_success).to.eq(1);
      expect(FCT.typedData.message["transaction_1"].call.jump_on_fail).to.eq(1);

      const callId = FCT.mcall[0].callId;
      const parsedCallId = CallID.parseWithNumbers(callId);

      expect(parsedCallId).to.be.eql({
        options: {
          gasLimit: "0",
          flow: "OK_STOP_FAIL_CONT",
          jumpOnFail: 1,
          jumpOnSuccess: 1,
          validation: 0,
        },
        viewOnly: false,
        permissions: "00",
        payerIndex: 1,
        callIndex: 1,
      });

      expect(FCT.typedData.message["transaction_2"].recipient).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
      expect(FCT.typedData.message["transaction_2"].amount).to.eq(
        // "0xFD00000000000000000000000000000000000000000000000000000000000001",
        variables.getOutputVariable({ index: 0, offset: 0 }),
      );

      expect(FCT.typedData.message["transaction_3"].recipient).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
      expect(FCT.typedData.message["transaction_3"].amount).to.eq("20");
      expect(FCT.typedData.message["transaction_3"].call.to_ens).to.eq("@token.kiro.eth");
    });
    it("Should create FCT with Computed Variables", async () => {
      const balanceOf = new ERC20.getters.BalanceOf({
        chainId: "1",
        initParams: {
          to: "0xfeab457d95d9990b7eb6c943c839258245541754",
          methodParams: {
            owner: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          },
        },
      });

      batchMultiSigCall.addComputed({
        id: "test",
        value1: {
          type: "output",
          id: {
            nodeId: "node2",
            innerIndex: 0,
          },
        },
        operator1: "-",
        value2: "1",
      });

      await batchMultiSigCall.createMultiple([
        {
          nodeId: "node2",
          plugin: balanceOf,
          from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        },
        {
          nodeId: "node1",
          to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          toENS: "@token.kiro.eth",
          method: "transfer",
          params: [
            { name: "recipient", type: "address", value: "0x4f631612941F710db646B8290dB097bFB8657dC2" },
            {
              name: "amount",
              type: "uint256",
              value: {
                type: "computed",
                id: "test",
              },
            },
          ],
          from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        },
      ]);

      const FCT = batchMultiSigCall.exportFCT();

      expect(FCT).to.be.an("object");

      expect(FCT.typedData.message["transaction_2"].amount).to.eq(
        "0xFE00000000000000000000000000000000000000000000000000000000000001",
      );

      // expect(FCT.computed[0].values[0]).to.eq("0xFD00000000000000000000000000000000000000000000000000000000000001");
      expect(FCT.computed[0].values[0]).to.eq(variables.getOutputVariable({ index: 0, offset: 0 }));
      expect(FCT.computed[0].operators[0]).to.eq(ethers.utils.id("-"));
    });
    //
    // NOTE: THIS METHOD IS REMOVED
    //
    // it("Should create FCT with encoded data and ABI", async () => {
    //   const ABI = [
    //     {
    //       inputs: [
    //         { internalType: "address", name: "operator", type: "address" },
    //         {
    //           components: [
    //             { internalType: "bool", name: "activate", type: "bool" },
    //             { internalType: "bool", name: "activateBatch", type: "bool" },
    //             { internalType: "bool", name: "activateForFree", type: "bool" },
    //             { internalType: "bool", name: "activateForFreeBatch", type: "bool" },
    //           ],
    //           internalType: "struct IFCT_ActuatorStorage.Approvals",
    //           name: "approvals",
    //           type: "tuple",
    //         },
    //       ],
    //       name: "setActivationApproval",
    //       outputs: [],
    //       stateMutability: "nonpayable",
    //       type: "function",
    //     },
    //   ];
    //
    //   const FCT = new BatchMultiSigCall({
    //     chainId: "5",
    //   });
    //
    //   FCT.setCallDefaults({
    //     from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
    //   });
    //
    //   const iface = new ethers.utils.Interface(ABI);
    //
    //   const encodedData = iface.encodeFunctionData("setActivationApproval", [
    //     "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    //     [true, true, true, true],
    //   ]);
    //
    //   const call = await FCT.create({
    //     encodedData,
    //     abi: ABI,
    //     to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
    //   } as const);
    //
    //   const params = call.get.params as Param[];
    //
    //   expect(call).to.be.an("object");
    //
    //   expect(params[0]).to.eql({
    //     name: "operator",
    //     type: "address",
    //     value: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    //   });
    //   expect(params[1]).to.eql({
    //     name: "approvals",
    //     type: "tuple",
    //     customType: true,
    //     value: [
    //       { name: "activate", type: "bool", value: true },
    //       { name: "activateBatch", type: "bool", value: true },
    //       { name: "activateForFree", type: "bool", value: true },
    //       { name: "activateForFreeBatch", type: "bool", value: true },
    //     ],
    //   });
    //
    //   const FCTExport = FCT.exportFCT();
    //
    //   expect(FCTExport).to.be.an("object");
    //
    //   expect(FCTExport.typedData.message["transaction_1"].operator).to.eq("0x8ba1f109551bD432803012645Ac136ddd64DBA72");
    //   expect(FCTExport.typedData.message["transaction_1"].approvals).to.eql({
    //     activate: true,
    //     activateBatch: true,
    //     activateForFree: true,
    //     activateForFreeBatch: true,
    //   });
    //
    //   expect(FCTExport.mcall[0].data).to.eq(`0x${encodedData.slice(10)}`);
    // });
    it("Should create FCT with tuple array", async () => {
      const FCT = new BatchMultiSigCall({
        chainId: "1",
      });

      const tupleArrayValue = [
        {
          name: "to",
          type: "address",
          value: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        },
        {
          name: "value",
          type: "uint256",
          value: "30000",
        },
        {
          name: "isDeposit",
          type: "bool",
          value: true,
        },
      ];

      await FCT.add({
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        method: "multicall",
        params: [
          {
            name: "data",
            type: "tuple[]",
            customType: true,
            value: [tupleArrayValue],
          },
          {
            name: "path",
            type: "address[]",
            value: [
              { type: "external", id: 0 },
              { type: "external", id: 1 },
            ],
          },
        ],
      });

      const fctData = FCT.exportFCT();

      expect(fctData.typedData.message["transaction_1"].call.method_interface).to.eq(
        "multicall((address,uint256,bool)[],address[])",
      );

      expect(fctData.typedData.message["transaction_1"].data).to.deep.eq([
        tupleArrayValue.reduce((acc, cur) => {
          return {
            ...acc,
            [cur.name]: cur.value,
          };
        }, {}),
      ]);

      expect(fctData.mcall[0].types).to.deep.eq([4000, 3, 1000, 1000, 1000, 4000, 1000]);
    });
    it("Should create FCT where one of params are an empty array", async () => {
      const FCT = new BatchMultiSigCall({
        chainId: "1",
      });

      await FCT.add({
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        method: "methodName",
        params: [
          {
            name: "recipientAddresses",
            type: "address[]",
            value: [],
          },
          {
            name: "amounts",
            type: "uint256[]",
            value: [],
          },
        ],
      });

      const fctData = FCT.exportFCT();

      expect(fctData.typedData.message["transaction_1"].call.method_interface).to.eq("methodName(address[],uint256[])");
      expect(fctData.typedData.message["transaction_1"].recipientAddresses).to.deep.eq([]);
      expect(fctData.typedData.message["transaction_1"].amounts).to.deep.eq([]);

      expect(fctData.mcall[0].types).to.deep.eq([4000, 1000, 4000, 1000]);
    });
    it("Should create FCT where one of params is fixed length array", async () => {
      const FCT = new BatchMultiSigCall({
        chainId: "1",
      });

      const addresses = [createRandomAddress(), createRandomAddress(), createRandomAddress()];

      await FCT.add({
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        method: "methodName",
        params: [
          {
            name: "recipientAddresses",
            type: "address[3]",
            value: addresses,
          },
        ],
      });

      const fctData = FCT.exportFCT();

      expect(fctData.typedData.message["transaction_1"].call.method_interface).to.eq("methodName(address[3])");
      expect(fctData.typedData.message["transaction_1"].recipientAddresses).to.deep.eq(addresses);

      expect(fctData.mcall[0].types).to.deep.eq([5000, 3, 1000]);
    });
  });
  describe("getAllRequiredApprovals", () => {
    it("Should get required approvals", async () => {
      const FCT = new BatchMultiSigCall({
        chainId: "1",
      });

      const token = createRandomAddress();
      const recipient = createRandomAddress();
      const from = createRandomAddress();
      const transferFrom = createRandomAddress();

      const TransferFrom = new ERC20.actions.TransferFrom({
        chainId: "1",
        initParams: {
          to: token,
          methodParams: {
            from: transferFrom,
            to: recipient,
            amount: "30000",
          },
        },
      });

      await FCT.add({
        from,
        plugin: TransferFrom,
      });

      const requiredApprovals = await FCT.utils.getAllRequiredApprovals();
      expect(requiredApprovals.length).to.eq(1);

      const requiredApproval = requiredApprovals[0] as IRequiredApproval & { protocol: "ERC20" };

      expect(requiredApproval.token).to.eq(token);
      expect(requiredApproval.from).to.eq(transferFrom);
      expect(requiredApproval.params.spender).to.eq(from);
      expect(requiredApproval.params.amount).to.eq("30000");
    });
  });
});
