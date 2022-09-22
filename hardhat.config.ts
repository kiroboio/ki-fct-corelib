import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-truffle5";
import { HardhatUserConfig } from "hardhat/types";

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
      chainId: 4,
      allowUnlimitedContractSize: true,
      // forking: {
      //   url: "https://eth-mainnet.g.alchemy.com/v2/woeVEuX9KS1k0ayHbSa-ZZ3LmRIrrWB_",
      // },
      accounts: {
        mnemonic: "awesome grain neither pond excess garage tackle table piece assist venture escape",
        count: 10,
      },
    },
  },
};

export default config;
