import { Contract, ethers } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
import { defaultAbiCoder, toUtf8Bytes } from "ethers/lib/utils";

// Most likely the data structure is going to be different
interface TransferCall {
  token: string;
  to: string;
  value: number;
  signer: string;
}

interface Transfer {
  signer: string;
  r: string;
  s: string;
  token: string;
  to: string;
  value: number;
  sessionId: string;
}

const getBatchTransferPackedData = async (call: TransferCall, i: number, signer, factoryProxy: Contract) => {
  const FACTORY_DOMAIN_SEPARATOR = await factoryProxy.DOMAIN_SEPARATOR();
  const BATCH_TRANSFER_PACKED_TYPEHASH = await factoryProxy.BATCH_TRANSFER_PACKED_TYPEHASH_();

  const group = "000002"; // Has to be a way to determine group dynamically
  const tnonce = "00000000";
  const after = "0000000000";
  const before = "ffffffffff";
  const maxGas = "00000000";
  const maxGasPrice = "0000000ba43b7400";
  const eip712ERC20 = "f0"; // payment + eip712

  const getSessionId = (index: number) => {
    return `0x${group}${tnonce}${index
      .toString(16)
      .padStart(2, "0")}${after}${before}${maxGas}${maxGasPrice}${eip712ERC20}`;
  };
  const hashedData = {
    ...call,
    _hash: defaultAbiCoder.encode(
      ["bytes32", "address", "address", "uint256", "uint256"],
      [BATCH_TRANSFER_PACKED_TYPEHASH, call.token, call.to, call.value, getSessionId(i)]
    ),
  };

  const signature = await signer.signMessage(
    FACTORY_DOMAIN_SEPARATOR + ethers.utils.keccak256(hashedData._hash).slice(2)
  );
  const rlp = ethers.utils.splitSignature(signature);
  const v = "0x" + rlp.v.toString(16);

  return {
    signer: call.signer,
    r: rlp.r,
    s: rlp.s,
    token: call.token,
    to: call.to,
    value: call.value,
    sessionId: getSessionId(i) + v.slice(2).padStart(2, "0"),
  };
};

export class BatchTransferPacked {
  calls: Array<Transfer>;
  constructor() {
    this.calls = [];
  }

  async addTx(txCall: TransferCall, signer, factoryProxy: Contract) {
    const data = await getBatchTransferPackedData(txCall, this.calls.length, signer, factoryProxy);
    this.calls = [...this.calls, data];
  }

  async addMultipleTx(txCalls: Array<TransferCall>, signer, factoryProxy: Contract) {
    const data = await Promise.all(
      txCalls.map((item, i) => getBatchTransferPackedData(item, this.calls.length + (i + 1), signer, factoryProxy))
    );
    this.calls = [...this.calls, ...data];
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

    const data = await factoryProxy.connect(activator).batchTransferPacked_(calls, 2, silentRevert);
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
