import ganache, { ServerOptions } from "ganache";
// Removed from package.json
// "pretest": "pkill -xf 'ts-node test/ganache.ts'; ts-node test/ganache.ts &",
// "test": "mocha -r ts-node/register test/*.test.ts",
// "posttest": "pkill -xf 'ts-node test/ganache.ts'"

const port = 9545;
const mnemonic = "awesome grain neither pond excess garage tackle table piece assist venture escape";
const accounts = 200;

const options: ServerOptions = {
  total_accounts: accounts,
  gasLimit: 22500000,
  chain: {
    chainId: 4,
    networkId: 4,
  },
  default_balance_ether: 1000,
  quiet: true,
  wallet: {
    mnemonic,
  },
};

const server = ganache.server(options);

server.listen(port, (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});

console.log("Starting Ganache server");
