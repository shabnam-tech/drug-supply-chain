require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.19",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
        "0xe22a8099a90afa04079d07b25538a0c86085d09ecc7186c208bcb375999b96e8"
      ]
    }
  }
};