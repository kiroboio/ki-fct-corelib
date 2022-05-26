import { Contract, ethers } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
import { toUtf8Bytes } from "ethers/lib/utils";

// Most likely the data structure is going to be different
interface TransferCall {
  token: string;
  tokenEnsHash: string | null;
  to: string;
  toEnsHash: string | null;
  value: string;
  signer: string;
  cancelable: Boolean;
  payable: Boolean;
}

interface Transfer {
  token: string;
  tokenEnsHash: string;
  to: string;
  toEnsHash: string;
  value: string;
  signer: string;
  r: string;
  s: string;
  sessionId: string;
}

// Move to seperate folder/file where all the helper functions will be located
const getTypedDataDomain = async (factoryProxy: Contract) => {
  const chainId = await factoryProxy.CHAIN_ID();
  console.log(chainId.toHexString());
  return {
    domain: {
      name: await factoryProxy.NAME(), // await factoryProxy.NAME(),
      version: await factoryProxy.VERSION(), // await factoryProxy.VERSION(),
      chainId: chainId.toHexString(),
      verifyingContract: factoryProxy.address,
      salt: await factoryProxy.uid(),
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

const getBatchTransferData = async (call: TransferCall, i: number, signer, factoryProxy: Contract) => {
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
    ...(await getTypedDataDomain(factoryProxy)),
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

  const messageDigest = TypedDataUtils.encodeDigest(typedData);
  const signature = await signer.signMessage(messageDigest);
  const rlp = ethers.utils.splitSignature(signature);
  console.log("0x" + rlp.v.toString(16), Number("0x" + rlp.v.toString(16)));
  const v = "0x" + rlp.v.toString(16);

  return {
    r: rlp.r,
    s: rlp.s,
    signer: call.signer,
    token: call.token,
    tokenEnsHash: call.tokenEnsHash
      ? ethers.utils.keccak256(toUtf8Bytes(call.tokenEnsHash))
      : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    to: call.to,
    toEnsHash: call.toEnsHash
      ? ethers.utils.keccak256(toUtf8Bytes(call.toEnsHash))
      : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    value: call.value,
    sessionId: sessionId + v.slice(2).padStart(2, "0"),
  };
};

export class BatchTransfer {
  calls: Array<Transfer>;
  constructor() {
    this.calls = [];
  }

  async addTx(txCall: TransferCall, signer, factoryProxy: Contract) {
    const data = await getBatchTransferData(txCall, this.calls.length, signer, factoryProxy);
    this.calls = [...this.calls, data];
  }

  // removeTx(txCall: TransferCall) {
  //   // Will the tx call have a seperate id?
  //   // this.calls = this.calls.filter(...)
  // }

  async executeWithEthers(factoryProxy: Contract, activator, silentRevert: Boolean) {
    const calls = this.calls;

    if (calls.length === 0) {
      throw new Error("there are no added calls");
    }

    try {
      const data = await factoryProxy.connect(activator).batchTransfer_(calls, 0, silentRevert);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  }

  // Should pass web3 from frontend
  async execute(web3, silentRevert: Boolean) {
    const calls = this.calls;

    const group = "000000";

    if (calls.length === 0) {
      throw new Error("There are no added calls");
    }

    // const batchTransferCalls = await Promise.all(calls.map(getBatchTransferData));

    // BEFORE TX - estimate gas function

    // await factoryProxy.batchTransfer_(batchTransferCalls, parseInt(group, 16), silentRevert);

    return;
  }
}
