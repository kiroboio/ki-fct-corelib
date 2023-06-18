import { AaveV2, ChainId, ERC20 } from "@kiroboio/fct-plugins";
import { expect } from "chai";
import { ethers } from "ethers";

import { Flow } from "../../../constants";
import { flows } from "../../../constants/flows";
import { getDate } from "../../../helpers";
import { CallOptions, IMSCallInput, Param } from "../../../types";
import { CallID, SessionID } from "../classes";
import { BatchMultiSigCall } from "../index";
import { FCTCreateCallErrors } from "./call.test";
import { FCTOptionsErrors } from "./options.test";

// Create a function that creates a random address
const createRandomAddress = () => ethers.Wallet.createRandom().address;

describe("BatchMultiSigCall", () => {
  let batchMultiSigCall: BatchMultiSigCall;

  beforeEach(async () => {
    batchMultiSigCall = new BatchMultiSigCall({
      chainId: "5",
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
        builder: "0x4f631612941F710db646B8290dB097bFB8657dC2",
      };

      expect(batchMultiSigCall.setOptions(validSettings)).to.be.an("object");
      expect(batchMultiSigCall.options.builder).to.be.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
      expect(batchMultiSigCall.options.maxGasPrice).to.be.eq("100000000000");
      expect(batchMultiSigCall.options.expiresAt).to.be.eq(expiresAt);
      expect(batchMultiSigCall.options.purgeable).to.be.eq(true);
      expect(batchMultiSigCall.options.blockable).to.be.eq(true);
    });

    it("Should expect chainId to be changed", () => {
      batchMultiSigCall.changeChainId("1");
      expect(batchMultiSigCall.chainId).to.be.eq("1");
      expect(batchMultiSigCall.domain.chainId).to.be.eq(1);
    });

    it("Should expect error if chainId is not supported", () => {
      expect(() => batchMultiSigCall.changeChainId("100" as ChainId)).to.throw(
        "ChainId 100 is not supported. Please provide a custom EIP712 domain."
      );
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

  describe("Complex FCTs", () => {
    it("Should create an FCT with 1 plugin call", async () => {
      const transfer = new ERC20.actions.Transfer({
        chainId: "5",
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
        chainId: "5",
        initParams: {
          to: "0xfeab457d95d9990b7eb6c943c839258245541754",
          methodParams: {
            owner: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          },
        },
      });

      const deposit = new AaveV2.actions.Deposit({
        chainId: "5",
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

      // parse SessionId
      const sessionId = SessionID.asOptions({
        sessionId: FCT.sessionId,
        builder: FCT.builder,
        name: FCT.typedData.message.meta.name,
      });
      expect(sessionId).to.be.an("object");
      expect(sessionId).to.be.eql({
        name: "",
        validFrom: batchMultiSigCall.options.validFrom,
        expiresAt: batchMultiSigCall.options.expiresAt,
        maxGasPrice: batchMultiSigCall.options.maxGasPrice,
        blockable: true,
        purgeable: false,
        authEnabled: true,
        builder: FCT.builder,
        recurrency: {
          accumetable: false,
          chillTime: "0",
          maxRepeats: "0",
        },
        multisig: {
          minimumApprovals: "0",
          externalSigners: [],
        },
      });

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
        },
        viewOnly: false,
        permissions: "00",
        payerIndex: 1,
        callIndex: 1,
      });

      expect(FCT.typedData.message["transaction_2"].recipient).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
      expect(FCT.typedData.message["transaction_2"].amount).to.eq("0xFD00000000000000000000000000000000000001");

      expect(FCT.typedData.message["transaction_3"].recipient).to.eq("0x4f631612941F710db646B8290dB097bFB8657dC2");
      expect(FCT.typedData.message["transaction_3"].amount).to.eq("20");
      expect(FCT.typedData.message["transaction_3"].call.to_ens).to.eq("@token.kiro.eth");
    });
    it("Should create FCT with Computed Variables", async () => {
      const balanceOf = new ERC20.getters.BalanceOf({
        chainId: "5",
        initParams: {
          to: "0xfeab457d95d9990b7eb6c943c839258245541754",
          methodParams: {
            owner: "0x4f631612941F710db646B8290dB097bFB8657dC2",
          },
        },
      });

      batchMultiSigCall.addComputed({
        id: "test",
        value: {
          type: "output",
          id: {
            nodeId: "node2",
            innerIndex: 0,
          },
        },
        sub: "10",
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

      expect(FCT.typedData.message["transaction_2"].amount).to.eq("0xFE00000000000000000000000000000000000001");

      expect(FCT.computed[0].value).to.eq("0xFD00000000000000000000000000000000000001");
      expect(FCT.computed[0].sub).to.eq("10");
    });
    it("Should create FCT with encoded data and ABI", async () => {
      const ABI = [
        {
          inputs: [
            { internalType: "address", name: "operator", type: "address" },
            {
              components: [
                { internalType: "bool", name: "activate", type: "bool" },
                { internalType: "bool", name: "activateBatch", type: "bool" },
                { internalType: "bool", name: "activateForFree", type: "bool" },
                { internalType: "bool", name: "activateForFreeBatch", type: "bool" },
              ],
              internalType: "struct IFCT_ActuatorStorage.Approvals",
              name: "approvals",
              type: "tuple",
            },
          ],
          name: "setActivationApproval",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];

      const FCT = new BatchMultiSigCall({
        chainId: "5",
      });

      FCT.setCallDefaults({
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
      });

      const iface = new ethers.utils.Interface(ABI);

      const encodedData = iface.encodeFunctionData("setActivationApproval", [
        "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
        [true, true, true, true],
      ]);

      const call = await FCT.create({
        encodedData,
        abi: ABI,
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
      } as const);

      const params = call.params as Param[];

      expect(call).to.be.an("object");

      expect(params[0]).to.eql({
        name: "operator",
        type: "address",
        value: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
      });
      expect(params[1]).to.eql({
        name: "approvals",
        type: "tuple",
        customType: true,
        value: [
          { name: "activate", type: "bool", value: true },
          { name: "activateBatch", type: "bool", value: true },
          { name: "activateForFree", type: "bool", value: true },
          { name: "activateForFreeBatch", type: "bool", value: true },
        ],
      });

      const FCTExport = FCT.exportFCT();

      expect(FCTExport).to.be.an("object");

      expect(FCTExport.typedData.message["transaction_1"].operator).to.eq("0x8ba1f109551bD432803012645Ac136ddd64DBA72");
      expect(FCTExport.typedData.message["transaction_1"].approvals).to.eql({
        activate: true,
        activateBatch: true,
        activateForFree: true,
        activateForFreeBatch: true,
      });

      expect(FCTExport.mcall[0].data).to.eq(`0x${encodedData.slice(10)}`);
    });
    it("should create FCT with tuple[] param", async () => {
      await batchMultiSigCall.create({
        to: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        method: "methodName",
        from: "0x4f631612941F710db646B8290dB097bFB8657dC2",
        params: [
          {
            name: "param",
            type: "tuple[]",
            value: [
              [
                { name: "param1", type: "uint256", value: "1" },
                { name: "param2", type: "uint256", value: "2" },
              ],
              [
                { name: "param1", type: "uint256", value: "3" },
                { name: "param2", type: "uint256", value: "4" },
              ],
            ],
          },
        ],
      });

      const FCT = batchMultiSigCall.exportFCT();
    });
  });
});