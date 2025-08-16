require("@nomicfoundation/hardhat-toolbox"); // chai, ethers, etc
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    chilizSpicy: {
      url: "https://spicy-rpc.chiliz.com",
      chainId: 88882,
      accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`] : [],
    },
  },
  etherscan: {
    apiKey: {
      // when/if Chiliz adds a block explorer API key, you can put it here
      // chilizSpicy: process.env.CHILIZ_API_KEY,
    },
  },
};
