import { defaultAbiCoder } from "ethers/lib/utils";
import Web3 from "web3";
import Contract from "web3/eth/contract";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import { getSessionIdDetails } from "../helpers";
import { TransferPackedInputInterface, TransferPackedInterface } from "./interfaces";

// DefaultFlag - "f0" // payment + eip712
const defaultFlags = {
  eip712: false,
  payment: true,
};

const getBatchTransferPackedData = async (FactoryProxy: Contract, call: TransferPackedInputInterface) => {
  const BATCH_TRANSFER_PACKED_TYPEHASH = await FactoryProxy.methods.BATCH_TRANSFER_PACKED_TYPEHASH_().call();
  const { sessionId } = getSessionIdDetails(call, defaultFlags, true);

  const encodedMessage = defaultAbiCoder.encode(
    ["bytes32", "address", "address", "uint256", "uint256"],
    [BATCH_TRANSFER_PACKED_TYPEHASH, call.token, call.to, call.value, sessionId]
  );

  return {
    signer: call.signer,
    token: call.token,
    to: call.to,
    value: call.value,
    sessionId,
    encodedMessage,
    inputData: call,
  };
};

export class BatchTransferPacked {
  calls: Array<TransferPackedInterface>;
  web3: Web3;
  FactoryProxy: Contract;

  constructor(web3: Web3, contractAddress: string) {
    this.calls = [];
    this.web3 = web3;
    // @ts-ignore
    this.FactoryProxy = new web3.eth.Contract(FactoryProxyABI, contractAddress);
  }

  decodeData(data: string) {
    const decodedData = defaultAbiCoder.decode(["bytes32", "address", "address", "uint256", "uint256"], data);

    return {
      token: decodedData[1],
      to: decodedData[2],
      value: decodedData[3].toString(),
      sessionId: decodedData[4].toHexString(),
    };
  }

  async addTx(tx: TransferPackedInputInterface) {
    const data = await getBatchTransferPackedData(this.FactoryProxy, tx);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  async addMultipleTx(tx: TransferPackedInputInterface[]) {
    const data = await Promise.all(tx.map((item, i) => getBatchTransferPackedData(this.FactoryProxy, item)));
    this.calls = [...this.calls, ...data];
    return this.calls;
  }

  async editTx(index: number, tx: TransferPackedInputInterface) {
    const data = await getBatchTransferPackedData(this.FactoryProxy, tx);

    this.calls[index] = data;

    return this.calls;
  }

  async removeTx(index: number) {
    const restOfCalls = this.calls
      .slice(index + 1)
      .map((call) => ({ ...call.inputData, nonce: call.inputData.nonce - 1 }));

    // Remove from calls
    this.calls.splice(index, 1);

    // Adjust nonce number for the rest of the calls
    const data = await Promise.all(restOfCalls.map((tx) => getBatchTransferPackedData(this.FactoryProxy, tx)));

    this.calls.splice(-Math.abs(data.length), data.length, ...data);

    return this.calls;
  }
}
