import Web3 from "web3";
import SimpleStorageContract from "../../src/contracts/SimpleStorage.json";

const options = {
  contracts: [SimpleStorageContract],
  web3: {
    fallback: {
      type: "ws",
      url: "ws://localhost:7545",
    },
  },
};

const web3 = new Web3("ws://localhost:7545");

const simpleStorage = new web3.eth.Contract(
  SimpleStorageContract.abi,
  SimpleStorageContract.networks["5777"].address
);

export { web3, simpleStorage };
