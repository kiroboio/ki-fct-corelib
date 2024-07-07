import { TypedDataDomain } from "../../types";
import { EIP712Base } from "../bases/EIP712Base";

const TYPED_DATA_DOMAIN: Record<string, TypedDataDomain> = {
  // Mainnet
  "1": {
    name: "FCT Controller",
    version: "1",
    chainId: 1,
    verifyingContract: "0x35c89b55Fd59C1FfAa29f35861c7C1eADa3777b3",
    salt: "0x010011fa53f6c730b542000035c89b55fd59c1ffaa29f35861c7c1eada3777b3",
  },
  // Arbitrum One
  "42161": {
    name: "FCT Controller",
    version: "1",
    chainId: 42161,
    verifyingContract: "0x7A45405D953974998fc447C196Fb015DC41C0650",
    salt: "0x0100af89b3a0314c9a2f00007a45405d953974998fc447c196fb015dc41c0650",
  },
  // Optimism
  "10": {
    name: "FCT Controller",
    version: "1",
    chainId: 10,
    verifyingContract: "0x6fA9FD5650aA8CC060D1F1aa18A6698578762643",
    salt: "0x01006d3fd6edbc877ee600006fa9fd5650aa8cc060d1f1aa18a6698578762643",
  },
  // Base
  "8453": {
    name: "FCT Controller",
    version: "1",
    chainId: 8453,
    verifyingContract: "0x2C6E704Af6C9afA0CCb39999e5556E6769106B80",
    salt: "0x01004d0588d433e6b9e400002c6e704af6c9afa0ccb39999e5556e6769106b80",
  },
  //
  // Testnets
  //
  // Sepolia
  "11155111": {
    name: "FCT Controller",
    version: "1",
    chainId: 11155111,
    verifyingContract: "0xEa34C0bF3057D3d2bC97902091c71a8D4c9747DC",
    salt: "0x01008fae4fc2403818850000ea34c0bf3057d3d2bc97902091c71a8d4c9747dc",
  },
  // Goerli (DEPRECATED)
  "5": {
    name: "FCT Controller",
    version: "1",
    chainId: 5,
    verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
    salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
  },
  // Arbitrum Goerli (DEPRECATED)
  "421613": {
    name: "FCT Controller",
    version: "1",
    chainId: 421613,
    verifyingContract: "0x574F4cDAB7ec20E3A37BDE025260F0A2359503d6",
    salt: "0x0100df6d107dcaba91640000574f4cdab7ec20e3a37bde025260f0a2359503d6",
  },
};

export class EIP712_020201 extends EIP712Base {
  getDomainData(chainId: string): TypedDataDomain {
    return TYPED_DATA_DOMAIN[chainId];
  }
}
