import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-truffle5";

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

export default {
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
      // forking: {
      //   url: "https://eth-mainnet.g.alchemy.com/v2/woeVEuX9KS1k0ayHbSa-ZZ3LmRIrrWB_",
      //   blockNumber: 14390000,
      // },
      accounts: {
        mnemonic: "awesome grain neither pond excess garage tackle table piece assist venture escape",
        count: 220,
      },
    },
  },
};
