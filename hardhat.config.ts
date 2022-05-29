import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-truffle5";

import "@nomiclabs/hardhat-waffle";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

export default {
  solidity: "0.8.13",
  networks: {
    hardhat: {
      chainId: 4,
      allowUnlimitedContractSize: true,
      accounts: {
        mnemonic: "awesome grain neither pond excess garage tackle table piece assist venture escape",
        count: 220,
      },
    },
  },
};
