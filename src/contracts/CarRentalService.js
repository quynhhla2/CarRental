import Web3 from "web3";
import CarRentalService from "./CarRentalService.json";

const options = {
  contracts: [CarRentalService],
  web3: {
    fallback: {
      type: "ws",
      url: "ws://localhost:7545",
    },
  },
};

// initialize web3 with Metamask's provider
const web3 = new Web3(window.ethereum);

// async function to set the default account after connecting to Metamask
async function setupWeb3() {
  // request access to the user's Metamask account
  await window.ethereum.enable();
  // set the default account to the account that deployed the contract
  const accounts = await web3.eth.getAccounts();
  web3.eth.defaultAccount = 0xe96dc6D2B514A92198Fa8bCB84F685D09B2e10dF;
}

// call the setup function to connect to Metamask and set the default account
setupWeb3();

const carRentalService = new web3.eth.Contract(
  CarRentalService.abi,
  CarRentalService.networks["5777"].address,
  { from: web3.eth.defaultAccount }
);

export { web3, carRentalService };
