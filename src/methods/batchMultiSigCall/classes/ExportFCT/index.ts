import { TypedDataUtils } from "@metamask/eth-sig-util";
import { utils } from "ethers";

import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { handleData, handleFunctionSignature, handleTypes } from "../../helpers";
import { DecodedCalls, IBatchMultiSigCallFCT, MSCall } from "../../types";
import { CallID } from "../CallID";
import { EIP712 } from "../EIP712";
import { FCTBase } from "../FCTBase";
import { Options } from "../Options";
import { SessionID } from "../SessionID";
import * as helpers from "./helpers";

const { hexlify, id } = utils;

export class ExportFCT extends FCTBase {
  public calls: DecodedCalls[];
  private _eip712: EIP712;

  constructor(FCT: BatchMultiSigCall) {
    super(FCT);
    this.calls = FCT.decodedCalls;
    this._eip712 = new EIP712(FCT);

    if (this.FCT.calls.length === 0) {
      throw new Error("FCT has no calls");
    }

    Options.verify(this.FCT.options);
  }

  get typedData() {
    return this._eip712.getTypedData();
  }

  get mcall() {
    return this.getCalls();
  }

  get sessionId() {
    return new SessionID(this.FCT).asString();
  }

  public get() {
    return {
      typedData: this.typedData,
      builder: this.FCT.options.builder,
      typeHash: hexlify(TypedDataUtils.hashType(this.typedData.primaryType as string, this.typedData.types)),
      sessionId: this.sessionId,
      nameHash: id(this.FCT.options.name),
      mcall: this.mcall,
      variables: [],
      externalSigners: this.FCT.options.multisig.externalSigners,
      signatures: [this.FCT.utils.getAuthenticatorSignature()],
      computed: this.FCT.computedWithValues.map((c) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { index, ...rest } = c;
        return rest;
      }),
    } satisfies IBatchMultiSigCallFCT;
  }

  public getCalls(): MSCall[] {
    const typedData = this.typedData;
    const calls = this.calls;

    return calls.map((call, index) => {
      const usedTypeStructs = helpers.getUsedStructTypes(typedData, `transaction${index + 1}`);

      return {
        typeHash: hexlify(TypedDataUtils.hashType(`transaction${index + 1}`, typedData.types)),
        ensHash: id(call.toENS || ""),
        functionSignature: handleFunctionSignature(call),
        value: this.FCT.variables.getValue(call.value, "uint256", "0"),
        callId: CallID.asString({
          calls,
          call,
          index,
        }),
        from: this.FCT.variables.getValue(call.from, "address"),
        to: this.FCT.variables.getValue(call.to, "address"),
        data: handleData(call),
        types: handleTypes(call),
        typedHashes:
          usedTypeStructs.length > 0
            ? usedTypeStructs.map((hash) => hexlify(TypedDataUtils.hashType(hash, typedData.types)))
            : [],
      };
    });
  }

  static helpers = helpers;
}