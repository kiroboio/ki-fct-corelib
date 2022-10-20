"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ethers");
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config = {
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
    paths: {
        sources: "./contracts",
    },
};
exports.default = config;
