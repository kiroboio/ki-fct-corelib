import { ethers } from "ethers";
import { TypedDataUtils } from "ethers-eip712";
import { defaultAbiCoder } from "ethers/lib/utils";
import Web3 from "web3";
import Contract from "web3/eth/contract";
import FactoryProxyABI from "../abi/factoryProxy_.abi.json";
import { TransferInputInterface, TransferInterface } from "./interfaces";
import { getTypedDataDomain, getSessionIdDetails } from "../helpers";

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

// DefaultFlag - "f1" // payment + eip712
const defaultFlags = {
  eip712: true,
  payment: true,
};

const getBatchTransferData = async (
  web3: Web3,
  FactoryProxy: Contract,
  factoryProxyAddress: string,
  call: TransferInputInterface
) => {
  const callDetails = getSessionIdDetails(call, defaultFlags, true);
  const typedData = {
    ...batchTransferTypedData,
    domain: await getTypedDataDomain(web3, FactoryProxy, factoryProxyAddress),
    message: {
      token_address: call.token,
      token_ens: call.tokenEnsHash || "",
      to: call.to,
      to_ens: call.toEnsHash || "",
      value: call.value,
      nonce: "0x" + callDetails.group + callDetails.nonce,
      valid_from: "0x" + callDetails.after,
      expires_at: "0x" + callDetails.before,
      gas_limit: "0x" + callDetails.maxGas,
      gas_price_limit: "0x" + callDetails.maxGasPrice,
      refund: callDetails.pureFlags.payment,
    },
  };
  const hashedData = ethers.utils.hexlify(
    TypedDataUtils.encodeData(typedData, typedData.primaryType, typedData.message)
  );

  return {
    signer: call.signer,
    token: call.token,
    tokenEnsHash: call.tokenEnsHash
      ? web3.utils.sha3(call.tokenEnsHash)
      : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    to: call.to,
    toEnsHash: call.toEnsHash
      ? web3.utils.sha3(call.toEnsHash)
      : "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    value: call.value,
    sessionId: callDetails.sessionId,
    hashedData,
    typedData,
    unhashedCall: call,
  };
};

export class BatchTransfer {
  calls: Array<TransferInterface>;
  web3: Web3;
  FactoryProxy: Contract;
  factoryProxyAddress: string;
  constructor(web3: Web3, contractAddress: string) {
    this.calls = [];
    this.web3 = web3;
    // @ts-ignore
    this.FactoryProxy = new web3.eth.Contract(FactoryProxyABI, contractAddress);
    this.factoryProxyAddress = contractAddress;
  }

  decodeData(data: string) {
    const decodedData = defaultAbiCoder.decode(
      [
        "bytes32",
        "address",
        "bytes32",
        "address",
        "bytes32",
        "uint256",
        "uint64",
        "uint40",
        "uint40",
        "uint32",
        "uint64",
        "bool",
      ],
      data
    );

    return {
      token: decodedData[1],
      tokenEnsHash:
        decodedData[2] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
          ? decodedData[2]
          : undefined,
      to: decodedData[3],
      toEnsHash:
        decodedData[4] !== "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
          ? decodedData[4]
          : undefined,
      value: decodedData[5].toString(),
      nonce: decodedData[6].toHexString(),
      afterTimestamp: decodedData[7],
      beforeTimestamp: decodedData[8],
      maxGas: decodedData[9],
      maxGasPrice: decodedData[10].toString(),
      payable: decodedData[11],
    };
  }

  async addTx(tx: TransferInputInterface) {
    const data = await getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);
    this.calls = [...this.calls, data];
    return this.calls;
  }

  async addMultipleTx(txs: TransferInputInterface[]) {
    const data = await Promise.all(
      txs.map((tx) => getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx))
    );
    this.calls = [...this.calls, ...data];
    return this.calls;
  }

  async editTx(index: number, tx: TransferInputInterface) {
    const data = await getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx);

    this.calls[index] = data;

    return this.calls;
  }

  async removeTx(index: number) {
    const restOfCalls = this.calls
      .slice(index + 1)
      .map((call) => ({ ...call.unhashedCall, nonce: call.unhashedCall.nonce - 1 }));

    // Remove from calls
    this.calls.splice(index, 1);

    // Adjust nonce number for the rest of the calls
    const data = await Promise.all(
      restOfCalls.map((tx) => getBatchTransferData(this.web3, this.FactoryProxy, this.factoryProxyAddress, tx))
    );

    this.calls.splice(-Math.abs(data.length), data.length, ...data);

    return this.calls;
  }
}
