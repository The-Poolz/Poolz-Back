/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
const HDWalletProvider = require("@truffle/hdwallet-provider");
const teamsMnemonic = "enhance scan dose rib lab jelly damage box museum leaf tail retreat";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    sandbox: {
      provider: function () {
        return new HDWalletProvider(teamsMnemonic, "https://sandbox.truffleteams.com/eba6142f-5458-471a-853a-93df3149f12c", 0, 10, false);
      },
      network_id: 1601895393000
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24",
      docker: false,
      parser: "solcjs",
    }
  }
};
