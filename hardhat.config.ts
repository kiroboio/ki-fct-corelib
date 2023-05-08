import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-ethers";

import { HardhatUserConfig } from "hardhat/types";

// Import dot env

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    hardhat: {
      chainId: 1,
      allowUnlimitedContractSize: true,
    },
  },
  paths: {
    tests: "./hardhat_test",
  },
};

export default config;
