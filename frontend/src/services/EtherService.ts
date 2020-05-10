import { ethers } from 'ethers';

// TODO: handle account change
// TODO: handle network change
// TODO: check that the retrieved provider / signer is valid
// TOOD: window.ethereum.enable() will be deprecated by MetaMask => find a fallback solution
export default class EtherService {
  ethereum: any;
  provider: any;
  signer: any;
  contractAddress: string;
  abi: Array<string>;

  constructor() {
    this.ethereum = (window as any).ethereum;

    // TODO: handle scenario when window.ethereum is undefined
    if (this.isEthereumNodeAvailable()) {
      this.provider = new ethers.providers.Web3Provider(this.ethereum, 'ropsten');
      this.signer = new ethers.providers.Web3Provider(this.ethereum, 'ropsten').getSigner();
    }

    // TODO: retrieve Deployer contractAddress from DB
    this.contractAddress = '0x8dF42792C58e7F966cDE976a780B376129632468';

    // TODO: can we generate ABI or retrieve it from compiled contract dynamically?
    this.abi = [
      'event NewMeetingEvent(address ownerAddr, address contractAddr)',
      'function deploy(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external returns(address)'
    ];
  }

  private isEthereumNodeAvailable() {
    return typeof this.ethereum !== 'undefined';
  }

  public async requestConnection() {
    return new Promise<string>(async (resolve, reject) => {
      if (this.isEthereumNodeAvailable()) {
        const accounts = await this.ethereum.enable().catch((err: any) => reject(err.message));
        
        const selectedAddress = accounts?.length > 0 ? accounts[0] : null;
        
        // TODO: verify whether it is possible to delete all accounts from MM, if not, just resolve selectedAddress
        if (selectedAddress === null) {
          reject('No accounts linked to MetaMask.');
        } else {
          resolve(selectedAddress);
        }
      } else {
        reject('Please install MetaMask to interact with Ethereum blockchain.');
      }
    });
  }

	public async deployFirstMeeting() {
    return new Promise<string>(async (resolve, reject) => {
      // TODO: verify whether we need this check in all functions or if we can refactor it globally on connection change
      if (this.isEthereumNodeAvailable()) {
        const contract = new ethers.Contract(this.contractAddress, this.abi, this.signer);

        contract
          .on("NewMeetingEvent", (ownerAddr, contractAddr, event) => {
            console.log("Owner addr: " + ownerAddr);
            console.log("Contract addr: " + contractAddr);
            console.log(event.blockNumber);
          })
          .on("error", console.error);

        const tx = await contract.deploy(0, 1, 1, 1).catch((err: any) => reject(err.message));

        resolve(tx);
      } else {
        reject('Please install MetaMask to interact with Ethereum blockchain.');
      }
    });
	}

  // public async startMeeting(...) {...}
  // public async rsvpMeeting(...) {...}
  // public async endMeeting(...) {...}
  // ...
  
}