import { TypedDataUtils } from "@metamask/eth-sig-util";
import { hexlify, id } from "ethers/lib/utils";

import { DecodedCalls, IBatchMultiSigCallFCT } from "../../../types";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { handleData, handleFunctionSignature, handleTypes } from "../../helpers/handlers";
import { MSCall } from "../../types/general";
import { CallID } from "../CallID";
import { FCTBase } from "../FCTBase";
import { Options } from "../Options";
import { SessionID } from "../SessionID";
import * as helpers from "./helpers";

export class ExportFCT extends FCTBase {
  public calls: DecodedCalls[];

  static helpers = helpers;

  constructor(FCT: BatchMultiSigCall) {
    super(FCT);
    this.calls = FCT.decodedCalls;

    if (this.FCT.calls.length === 0) {
      throw new Error("FCT has no calls");
    }

    Options.verify(this.FCT.options);
  }

  get typedData() {
    return this.FCT._eip712.getTypedData();
  }

  get mcall() {
    return this.getCalls();
  }

  get sessionId() {
    return SessionID.asStringFromExportFCT(this);
  }

  public get(): IBatchMultiSigCallFCT {
    return {
      typedData: this.typedData,
      builder: this.FCT.options.builder,
      typeHash: hexlify(TypedDataUtils.hashType(this.typedData.primaryType as string, this.typedData.types)),
      sessionId: this.sessionId,
      nameHash: id(this.FCT.options.name),
      mcall: this.mcall,
      variables: [],
      externalSigners: [],
      signatures: [this.FCT.utils.getAuthenticatorSignature()],
      computed: this.FCT.computedWithValues.map((c) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { index, ...rest } = c;
        return rest;
      }),
    };
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
        value: this.FCT._variables.getValue(call.to, "uint256", "0"),
        callId: CallID.asString({
          calls,
          call,
          index,
        }),
        from: this.FCT._variables.getValue(call.from, "address"),
        to: this.FCT._variables.getValue(call.to, "address"),
        data: handleData(call),
        types: handleTypes(call),
        typedHashes:
          usedTypeStructs.length > 0
            ? usedTypeStructs.map((hash) => hexlify(TypedDataUtils.hashType(hash, typedData.types)))
            : [],
      };
    });
  }
}
