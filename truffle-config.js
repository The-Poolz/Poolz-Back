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
//const teamsMnemonic = "enhance scan dose rib lab jelly damage box museum leaf tail retreat";
const mnemonic = "peace destroy flock enact stay exotic shop random strike hobby mistake unfold";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      //gas: 7721974
    },
    rinkeby: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      from: "0xeBCE75948DF6Fe95c5B964c3cDeb71808b615670", // default address to use for any transaction Truffle makes during migrations
      network_id: 4,
      gas: 4612388 // Gas limit used for deploys
    },
    tomotestnet: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          "https://rpc.testnet.tomochain.com",
          0,
          1,
          true,
          "m/44'/60'/0'/0/"
        ),
      network_id: "89",
      gas: 8000000,
      gasPrice: 10000000000000
    }
  },
  plugins: ["solidity-coverage"],
  compilers: {
    solc: {
      settings: {
        evmVersion: "byzantium"
      },
      version: "^0.4.24",
      docker: false,
      parser: "solcjs",
    }
  }
};
