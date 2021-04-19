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
const { mnemonic, rinkebyInfuraEndpoint, etherscanKey } = require("./secret");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
    },
    rinkeby: {
      provider: () => {
        return new HDWalletProvider(mnemonic, rinkebyInfuraEndpoint)
      },
      // from: "0xeBCE75948DF6Fe95c5B964c3cDeb71808b615670", // default address to use for any transaction Truffle makes during migrations
      network_id: 4,
      gas: 4612388 // Gas limit used for deploys
    },
    Huobi: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          "https://http-testnet.hecochain.com",
          0,
          1,
          true,
          "m/44'/60'/0'/0/"
        ),
      network_id: "256",
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
  plugins: ["solidity-coverage", "truffle-plugin-verify"],
  api_keys: {
    etherscan: etherscanKey
  },
  compilers: {
    solc: {
      settings: {
        evmVersion: "byzantium",
        optimizer: { enabled: true, runs: 200 },
      },     
      version: "^0.6.0",
      docker: false,
      parser: "solcjs",
    }
  }
};
