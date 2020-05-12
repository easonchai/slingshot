import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';

// TODO: handle account change
// TODO: handle network change
// TODO: check that the retrieved provider / signer is valid
// TOOD: window.ethereum.enable() will be deprecated by MetaMask => find a fallback solution
let overrides = {value: 1};

export default class EtherService {
  network: string;
  ethereum: any;
  provider: Provider;
  signer: any;
  contractAddress: string;
  deployerABI: Array<string>;
  meetingABI: Array<string>;

  constructor() {
    this.network = 'rinkeby';
    this.ethereum = (window as any).ethereum;
    
    // TODO: handle scenario when window.ethereum is undefined
    if (this.isEthereumNodeAvailable()) {
      this.provider = new ethers.providers.Web3Provider(this.ethereum, this.network);
      this.signer = new ethers.providers.Web3Provider(this.ethereum, this.network).getSigner();
    } else {
      this.provider = ethers.getDefaultProvider(this.network);
      this.signer = null;
    }

    // TODO: retrieve Deployer contractAddress from DB
    this.contractAddress = '0x8dF42792C58e7F966cDE976a780B376129632468';

    // TODO: can we generate ABI or retrieve it from compiled contract dynamically?
    this.deployerABI = [
      'event NewMeetingEvent(address ownerAddr, address contractAddr)',
      'function deploy(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external returns(address)'
    ];
    
    this.meetingABI = [
      'event RSVPEvent(address addr)',
      'function rsvp() external payable'
      // ...
    ];
  }

  private isEthereumNodeAvailable(): boolean {
    return typeof this.ethereum !== 'undefined';
  }

  public async requestConnection(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      if (this.isEthereumNodeAvailable()) {
        const accounts =
          await this.ethereum
            .enable()
            .catch((error: any) => {
              reject(error.message);
            });
        
        // TODO: verify whether it is possible to delete all accounts from MM, if not, just resolve selectedAddress
        const selectedAddress = accounts?.length > 0 ? accounts[0] : null;
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

	public async deployFirstMeeting(
    startDate: number,
    endDate: number,
    minStake: number,
    registrationLimit: number,
    eventCallback: (event: any) => void
    ): Promise<string>
    {
        return new Promise<string>(async (resolve, reject) => {
            // TODO: verify whether we need this check in all functions or if we can refactor it globally on connection change
            if (this.isEthereumNodeAvailable()) {
                const contract = new ethers.Contract(this.contractAddress, this.deployerABI, this.signer);

                // Notify frontend about successful deployment (TX mined)
                contract
                    .on("NewMeetingEvent", (ownerAddr, contractAddr, event) => eventCallback(event))
                    .on("error", console.error);

                // Send TX
                contract
                    .deploy(startDate, endDate, minStake, registrationLimit)
                    .then(
                      (success: any) => resolve(success),
                      (reason: any) => reject(reason)
                    )
                    .catch((error: any) => reject(error.message));
            } else {
                reject('Please install MetaMask to interact with Ethereum blockchain.');
            }
        });
	}

  // public async startMeeting(...): Promise<string> {...}
  // public async endMeeting(...): Promise<string> {...}
  // ...

  public async rsvp(
    meetingAddress: string,
    eventCallback: (event: any) => void
    ): Promise<string>
    {
        return new Promise<string>(async (resolve, reject) => {
            const contract = new ethers.Contract(meetingAddress, this.meetingABI, this.signer);

            // Notify frontend about successful RSVP (TX mined)
            contract
                .on("RSVPEvent", (addr, event) => eventCallback(event))
                .on("error", console.error);

            // Send TX
            contract
                .rsvp(overrides)
                .then(
                    (success: any) => resolve(success),
                    (reason: any) => reject(reason)
                )
                .catch((error: any) => reject(error.message));
        });
  }
}