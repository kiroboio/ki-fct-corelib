// Most likely the data structure is going to be different
interface TransferCall {
  token: String;
  tokenEnsHash: String | null;
  to: String;
  toEnsHash: String | null;
  value: String;
  signer: String;
  cancelable: Boolean;
  payable: Boolean;
}

// Move to seperate folder/file where all the helper functions will be located
const getTypedDataDomain = () => {
  return {
    domain: {
      name: "FACTORY_PROXY_NAME", // await factoryProxy.NAME(),
      version: "FACTORY_PROXY_VERSION", // await factoryProxy.VERSION(),
      chainId: "FACTORY_PROXY_CHAIN_ID", // "0x" + web3.utils.toBN(await factoryProxy.CHAIN_ID()).toString("hex"),
      verifyingContract: "FACTORY_PROXY_ADDReSS", // factoryProxy.address,
      salt: "FACTORY_PROXY_UID", // await factoryProxy.uid(),
    },
  };
};

const batchTransferTypedData = {
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
      { name: "salt", type: "bytes32" },
    ],
    BatchTransfer_: [
      { name: "token_address", type: "address" },
      { name: "token_ens", type: "string" },
      { name: "to", type: "address" },
      { name: "to_ens", type: "string" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint64" },
      { name: "valid_from", type: "uint40" },
      { name: "expires_at", type: "uint40" },
      { name: "gas_limit", type: "uint32" },
      { name: "gas_price_limit", type: "uint64" },
      { name: "refund", type: "bool" },
    ],
  },
  primaryType: "BatchTransfer_",
};

const getBatchTransferData = async (call: TransferCall, i: number) => {
  const group = "000000"; // Has to be a way to determine group dynamically
  const tnonce = "00000001" + i.toString(16).padStart(2, "0");
  const after = "0000000000";
  const before = "ffffffffff";
  const maxGas = "00000000";
  const maxGasPrice = "0000000ba43b7400";

  const cancelable = call.cancelable ? "8" : "1";
  const payable = call.payable ? "f" : "0";

  const eip712 = `${payable}${cancelable}`; // payment + eip712, need to make it editable from user side

  const sessionId = `0x${group}${tnonce}${after}${before}${maxGas}${maxGasPrice}${eip712}`;

  const typedData = {
    ...batchTransferTypedData,
    ...getTypedDataDomain(),
    message: {
      nonce: "0x" + group + tnonce,
      token_address: call.token,
      token_ens: call.tokenEnsHash,
      to: call.to,
      to_ens: call.toEnsHash,
      value: call.value,
      valid_from: "0x" + after,
      expires_at: "0x" + before,
      gas_limit: "0x" + maxGas,
      gas_price_limit: "0x" + maxGasPrice,
      refund: true,
    },
  };

  const eipSign = { r: "", s: "", v: "" }; // await getEIP712Sign(typedData, call.signer), signature (TO DO)

  return {
    ...eipSign,
    signer: call.signer,
    token: call.token,
    tokenEnsHash: call.tokenEnsHash,
    // tokenEnsHash: call.tokenEnsHash
    //   ? web3.utils.sha3(call.tokenEnsHash)
    //   : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    to: call.to,
    toEnsHash: call.toEnsHash,
    // toEnsHash: call.toEnsHash
    //   ? web3.utils.sha3(call.toEnsHash)
    //   : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    value: call.value,
    sessionId: sessionId + eipSign.v.slice(2).padStart(2, "0"),
  };
};

export class BatchTransfer {
  calls: Array<TransferCall>;
  constructor() {
    this.calls = [];
  }

  addTx(txCall: TransferCall) {
    this.calls = [...this.calls, txCall];
  }

  removeTx(txCall: TransferCall) {
    // Will the tx call have a seperate id?
    // this.calls = this.calls.filter(...)
  }

  // Should pass web3 from frontend
  async execute(web3, silentRevert) {
    const calls = this.calls;

    const group = "000000";

    if (calls.length === 0) {
      throw new Error("There are no added calls");
    }

    const batchTransferCalls = await Promise.all(calls.map(getBatchTransferData));

    // BEFORE TX - estimate gas function

    // await factoryProxy.batchTransfer_(batchTransferCalls, parseInt(group, 16), silentRevert);

    return;
  }
}
