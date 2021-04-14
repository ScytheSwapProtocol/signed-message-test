import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import { HardhatUserConfig } from "hardhat/types";

import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter"
import "hardhat-contract-sizer"
import "solidity-coverage"

const ALCHEMY_API_URI = "https://eth-mainnet.alchemyapi.io/v2/"
const ALCHEMY_API_KEY = "WpmEEL1pT5AIDFjXpRgyYFcb2fotz5Do"
const ALCHEMY_NETWORK_URL = `${ALCHEMY_API_URI}${ALCHEMY_API_KEY}`

const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const RINKEBY_PRIVATE_KEY =
  process.env.RINKEBY_PRIVATE_KEY! ||
  "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"; // well known private key
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [{ version: "0.8.2", settings: {} }],
  },
  networks: {
    hardhat:
    {
        forking: {
            url: `${ALCHEMY_NETWORK_URL}`,
            blockNumber: 12154761
        },
    },
    localhost: {},
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    coverage: {
      url: "http://127.0.0.1:8555", // Coverage launches its own ganache-cli client
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 0,
    bail: true
  },
        gasReporter: {
    enabled: true
  }
};

export default config;
