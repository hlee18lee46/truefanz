require('dotenv/config');
require('@nomiclabs/hardhat-ethers');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: { version: '0.8.20', settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    chilizSpicy: {
      url: process.env.CHILIZ_RPC || 'https://spicy-rpc.chiliz.com',
      chainId: 88882,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  paths: { sources: './contracts' },
};