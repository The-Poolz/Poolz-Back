const PrivateKeyProvider = require('./private-provider');
// Standalone Development Node Private Key
const { privateKeyDev } = require("./secret");
// Moonbase Alpha Private Key --> Please change this to your own Private Key with funds
const { privateKeyMoonbase } =  require("./secret");

module.exports = {
   networks: {
      dev: {
         provider: () => {
            if (!privateKeyDev.trim()) {
               throw new Error('Please enter a private key with funds, you can use the default one');
            }
            return new PrivateKeyProvider(privateKeyDev, 'http://localhost:9933/', 43)
         },
         network_id: 43,
      },
      moonbase: {
        networkCheckTimeout: 30000,
         provider: () => {
            if (!privateKeyMoonbase.trim()) {
               throw new Error('Please enter a private key with funds to send transactions to TestNet');
            }
            if (privateKeyDev == privateKeyMoonbase) {
               throw new Error('Please change the private key used for Moonbase to your own with funds');
            }
            return new PrivateKeyProvider(privateKeyMoonbase, 'https://rpc.testnet.moonbeam.network', 1287)
         },
         network_id: 1287,
         gas: 5100000
      },
   },

   plugins: ['moonbeam-truffle-plugin'],
   compilers: {
    solc: {
      settings: {
        evmVersion: "byzantium"
      },
      version: "^0.6.0",
      docker: false,
      parser: "solcjs",
    }
  }
};