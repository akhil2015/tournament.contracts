require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config = {
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      }
    }
  },
  networks: {
    hardhat: {
      accounts: {
        accountsBalance: "10000000000000000000000000000"
      },
    },
    mumbai: {
      url: `${process.env.MUMBAI_URL}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
  },

  gasReporter: {
    currency: 'USD',
    gasPrice: 100,
  },


};

module.exports = config;