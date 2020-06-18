import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';

// TODO: check that the retrieved provider / signer is valid
// TOOD: window.ethereum.enable() will be deprecated by MetaMask => find a fallback solution
export default class EtherService {
  network: string;
  ethereum: any;
  provider: Provider;
  signer: any;
  contractAddress: string;
  deployerABI: Array<string>;
  meetingABI: Array<string>;
  clubABI: Array<string>;

  private static instance: EtherService;

  private constructor() {
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
    this.contractAddress = '0xB96D588C7A4FAa5F25CE776096BcB68FAA8803BB';

    // TODO: can we generate ABI or retrieve it from compiled contract dynamically?
    this.deployerABI = [
      'event NewClub(address admin, address clubAddress)',
      'function deploy(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external returns(address payable)'
    ];

    this.meetingABI = [
      'event EventCancelled()',
      'event GetChange()',
      'event GuyCancelled(address participant)',
      'event MarkAttendance(address _participant)',
      'event WithdrawEvent(address addr, uint payout)',
      'event RSVPEvent(address addr)',
      'event StartEvent(address addr)',
      'event EndEvent(address addr, uint attendance, uint meetingPool, uint clubPool)',
      'event SetStakeEvent(uint stake)',
      'event EditStartDateEvent(uint timeStamp)',
      'event EditEndDateEvent(uint timeStamp)',
      'event EditMaxLimitEvent(uint max)',
      'event Refund(address addr, uint refund)',
      'event Pause(uint pausedUntil)',
      'function getChange() external',
      'function eventCancel() external notActive onlyOwner notCancelled',
      'function guyCancel() external notActive notCancelled',
      'function rsvp() external payable',
      'function cancel() external',
      'function markAttendance(address _participant) external',
      'function startEvent() external',
      'function endEvent() external onlyOwner duringEvent',
      'function setStartDate(uint dateTimestamp) external',
      'function setEndDate(uint dateTimestamp) external',
      'function finaliseEvent() external',
      'function setMinStake(uint stakeAmt) external',
      'function setRegistrationLimit(uint max) external',
      'function withdraw() external',
      'function nextMeeting(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external returns(address)',
      'function getBalance() external view returns (uint)',
      'function setPrevStake(uint _prevStake) external payable',
      'function destroyAndSend() external',
      'function pause(uint _pausedUntil) external',
      'function unPause(address _newOwner) external'
      // ...
    ];

    this.clubABI = [
      'event NewMeetingEvent(address ownerAddr, address contractAddr)',
      'event ProposalExecuted(address payable target, address payable[] addAdmins, address payable[] removeAdmins)',
      'event ProposeAdminChange(uint counter, address payable target, address payable[] addAdmins, address payable[] removeAdmins)',
      'event ApproveProposal(uint proposal)',
      'event PoolPayout(uint amount)',
      'function deployMeeting(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external',
      'function poolPayout(uint _amount) external',
      'function getBalance() external view returns (uint)',
      'function approveProposal(uint _proposal) external',
      'function executeProposal(uint _proposal) external',
      'function proposeAdminChange(address _target, address[] calldata _addAdmins, address[] calldata _removeAdmins) external',
      'function pause(address _meeting, uint _pauseUntil) external'
    ];
  }

  public static getInstance(): EtherService {
    if (!EtherService.instance) {
      EtherService.instance = new EtherService();
    }

    return EtherService.instance;
  }

  public isEthereumNodeAvailable(): boolean {
    return typeof this.ethereum !== 'undefined';
  }

  public getNetwork(): string {
    return this.ethereum?.networkVersion;
  }

  public getUserAddress(): string {
    return this.ethereum?.selectedAddress;
  }

  public addNetworkListener(chainChangeCallback: (chainID: string) => void) {
    this.ethereum.on('networkChanged', chainChangeCallback);
  }

  public addAccountListener(accChangeCallback: (accounts: string[]) => void) {
    this.ethereum.on('accountsChanged', accChangeCallback);
  }

  public addAllListeners(chainChangeCallback: (chainID: string) => void, accChangeCallback: (accounts: string[]) => void): void {
    this.addNetworkListener(chainChangeCallback);
    this.addAccountListener(accChangeCallback);
  }

  public removeAllListeners(): void {
    this.ethereum.removeAllListeners('networkChanged');
    this.ethereum.removeAllListeners('accountsChanged');
  }

  public findENSDomain(address: string, resolve: (domain: string) => void): void {
    this.provider.lookupAddress(address).then(domain => resolve(domain));
  }

  public resolveName(domain: string, resolve: (address: string) => void): void {
    this.provider.resolveName(domain).then(address => resolve(address));
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
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      // TODO: verify whether we need this check in all functions or if we can refactor it globally on connection change
      if (this.isEthereumNodeAvailable()) {
        const contract = new ethers.Contract(this.contractAddress, this.deployerABI, this.signer);

        // Notify frontend about successful deployment (TX mined)
        contract
          .once("NewMeetingEvent", (ownerAddr, contractAddr, event) => eventCallback(event))
          .once("error", console.error);

        // Send TX
        contract
          .deploy(startDate, endDate, ethers.utils.parseEther(String(minStake)), registrationLimit)
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

  public async rsvp(
    meetingAddress: string,
    stakeAmount: number,
    eventCallback: (event: any) => void
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      if (this.isEthereumNodeAvailable()) {
        const contract = new ethers.Contract(meetingAddress, this.meetingABI, this.signer);

        // Notify frontend about successful RSVP (TX mined)
        contract
          .once("RSVPEvent", (addr, event) => eventCallback(event))
          .once("error", console.error);

        // Send TX
        contract
          .rsvp({ value: ethers.utils.parseEther(String(stakeAmount)) })
          .then(
            (success: any) => resolve(success),
            (reason: any) => reject(reason)
          )
          .catch((error: any) => reject(error.reason));
      } else {
        reject('Please install MetaMask to interact with Ethereum blockchain.');
      }
    });
  }
  public async getChange(
    meetingAddress: string,
    eventCallback: (event: any) => void
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const contract = new ethers.Contract(meetingAddress, this.meetingABI, this.signer);

      contract
        .once("GetChange", (event) => eventCallback(event))
        .once("error", console.error);

      // Send TX
      contract
        .getChange()
        .then(
          (success: any) => resolve(success),
          (reason: any) => reject(reason)
        )
        .catch((error: any) => reject(error.reason));
    });
  }
  public async eventCancel(
    meetingAddress: string,
    eventCallback: (event: any) => void
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const contract = new ethers.Contract(meetingAddress, this.meetingABI, this.signer);

      contract
        .once("EventCancelled", (event) => eventCallback(event))
        .once("error", console.error);

      // Send TX
      contract
        .eventCancel()
        .then(
          (success: any) => resolve(success),
          (reason: any) => reject(reason)
        )
        .catch((error: any) => reject(error.reason));
    });
  }
  public async guyCancel(
    meetingAddress: string,
    eventCallback: (event: any) => void
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const contract = new ethers.Contract(meetingAddress, this.meetingABI, this.signer);

      contract
        .once("GuyCancelled", (participant, event) => eventCallback(event))
        .once("error", console.error);

      // Send TX
      contract
        .guyCancel()
        .then(
          (success: any) => resolve(success),
          (reason: any) => reject(reason)
        )
        .catch((error: any) => reject(error.reason));
    });
  }
  public async markAttendance(
    meetingAddress: string,
    _participant: any,//correct type?
    eventCallback: (event: any) => void
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const contract = new ethers.Contract(meetingAddress, this.meetingABI, this.signer);

      contract
        .once("MarkAttendance", (participant, event) => eventCallback(event))
        .once("error", console.error);

      // Send TX
      contract
        .markAttendance(_participant)
        .then(
          (success: any) => resolve(success),
          (reason: any) => reject(reason)
        )
        .catch((error: any) => reject(error.reason));
    });
  }
  public async startEvent(
    meetingAddress: string,
    eventCallback: (event: any) => void
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const contract = new ethers.Contract(meetingAddress, this.meetingABI, this.signer);

      contract
        .once("StartEvent", (addr, event) => eventCallback(event))
        .once("error", console.error);

      // Send TX
      contract
        .startEvent()
        .then(
          (success: any) => resolve(success),
          (reason: any) => reject(reason)
        )
        .catch((error: any) => reject(error.reason));
    });
  }
  public async endEvent(
    meetingAddress: string,
    eventCallback: (event: any) => void
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const contract = new ethers.Contract(meetingAddress, this.meetingABI, this.signer);

      contract
        .once("EndEvent", (addr, attendance, event) => eventCallback(event))
        .once("error", console.error);

      // Send TX
      contract
        .endEvent()
        .then(
          (success: any) => resolve(success),
          (reason: any) => reject(reason)
        )
        .catch((error: any) => reject(error.reason));
    });
  }
  public async withdraw(
    meetingAddress: string,
    eventCallback: (event: any) => void
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const contract = new ethers.Contract(meetingAddress, this.meetingABI, this.signer);

      contract
        .once("WithdrawEvent", (addr, event) => eventCallback(event))
        .once("error", console.error);

      // Send TX
      contract
        .withdraw()
        .then(
          (success: any) => resolve(success),
          (reason: any) => reject(reason)
        )
        .catch((error: any) => reject(error.reason));
    });
  }
  public async nextMeeting(
    meetingAddress: string,
    _startDate: number,
    _endDate: number,
    _minStake: number,
    _registrationLimit: number,
    eventCallback: (event: any) => void
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const contract = new ethers.Contract(meetingAddress, this.meetingABI, this.signer);

      contract
        .once("NextMeeting", (_startDate, _endDate, _minStake, _registrationLimit, _meeting, event) => eventCallback(event))
        .once("error", console.error);

      // Send TX
      contract
        .nextMeeting(_startDate, _endDate, ethers.utils.parseEther(String(_minStake)), _registrationLimit)
        .then(
          (success: any) => resolve(success),
          (reason: any) => reject(reason)
        )
        .catch((error: any) => reject(error.reason));
    });
  }
}