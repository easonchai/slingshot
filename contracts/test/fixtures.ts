import {expect, use} from 'chai';
import {utils, Contract, Wallet} from 'ethers';
import {createFixtureLoader, deployContract, MockProvider, solidity} from 'ethereum-waffle';
import Deployer from '../build/Deployer.json';
import Club from '../build/Club.json';
import Meeting from '../build/Meeting.json';

use(solidity);
/*const [wallet, walletTo] = new MockProvider({ganacheOptions:{
    gasLimit: "0x989680"}}).getWallets();
let deployer: Contract;
let club: Contract;
let meeting: Contract;*/

export const testTime = Math.round(Date.now() / 1000); //in seconds
export const start = testTime + 100;
export const end = testTime + 1000;
export const someProvider = new MockProvider({ganacheOptions:{
    gasLimit: "0x989680"}});

export let [wallet, wallet2, wallet3, guy] = someProvider.getWallets();

export const advanceTime = async (time: number) => {
    const timeReturn = await someProvider.send(
        'evm_increaseTime', [time]);
  }

export const loadFixture = createFixtureLoader([wallet, wallet2, wallet3, guy], someProvider);


export async function deployerFixture([wallet, other]: Wallet[], provider: MockProvider) {
    const deployer = await deployContract(wallet, Deployer, [], {gasLimit: "0x989680"});
    return {deployer, wallet, other};
  }; 

export async function clubFixture([wallet, other]: Wallet[], provider: MockProvider) {
    let p = await loadFixture(deployerFixture);
    const deployer = p.deployer;
    wallet = p.wallet;
    let tx = await deployer.deploy();
    //let GasUsed = (await (await deployer.deploy()).wait()).gasUsed.toString();
    let receipt = await tx.wait();
    let event = receipt.events.pop();
    const club = new Contract(event.args.clubAddress, Club.abi, wallet);
    return {club, wallet, other};
  };

export async function clubProposalFixture([wallet, other]: Wallet[], provider: MockProvider) {
    let p = await loadFixture(clubFixture);
    let club = p.club;
    wallet = p.wallet;
    await (await club.proposeAdminChange(club.address, [wallet2.address, wallet3.address], [])).wait();
    return {club, wallet, other};
}

export async function ProposalApproFixture([wallet, other]: Wallet[], provider: MockProvider) {
    let p = await loadFixture(clubProposalFixture);
    let club = p.club;
    wallet = p.wallet;
    await (await club.approveProposal(1)).wait();
    return {club, wallet, other};
}

export async function ProposalExeFixt([wallet, other]: Wallet[], provider: MockProvider) {
    let p = await loadFixture(ProposalApproFixture);
    let club = p.club;
    wallet = p.wallet;
    await (await club.executeProposal(1)).wait();
    return {club, wallet, other};
}

export async function MeetingDeployedFixt([wallet, other]: Wallet[], provider: MockProvider) {
    let p = await loadFixture(clubFixture);
    let club = p.club;
    wallet = p.wallet;
    let meetingAddress = (await (await club.deployMeeting(
        start, end, 1, 3)).wait())
        .events.pop().args.contractAddr;
    let meeting = new Contract(meetingAddress, Meeting.abi, wallet);
    return {meeting, wallet, other};
}

export async function MeetingBeforeStartFixt([wallet, other]: Wallet[], provider: MockProvider) {
    let p = await loadFixture(MeetingDeployedFixt);
    let meeting = p.meeting;
    let meeting2 = meeting.connect(wallet2);
    let meeting3 = meeting.connect(wallet3);
    await (await meeting2.rsvp({value:1})).wait();
    await (await meeting3.rsvp({value:1})).wait();
    console.log(wallet2.address, wallet3.address,
        (await p.meeting.testingCheckStake(wallet.address)).toNumber(),
        (await p.meeting.testingCheckStake(wallet2.address)).toNumber(),
        (await p.meeting.testingCheckStake(wallet3.address)).toNumber()
        );
    return {meeting, meeting2, meeting3};
};

export async function MeetingAfterStartFix([wallet, other]: Wallet[], provider: MockProvider) {
    let meeting: Contract;
    let meeting2: Contract;
    let p = await loadFixture(MeetingBeforeStartFixt);
    meeting = p.meeting2.connect(wallet);
    meeting2 = p.meeting2;
    console.log('here');
    console.log(
        (await meeting.testingCheckStake(wallet.address)).toNumber(),
        (await meeting.testingCheckStake(wallet2.address)).toNumber(),
        (await meeting.testingCheckStake(wallet3.address)).toNumber()
    );

    advanceTime(101);
    await (await p.meeting.startEvent()).wait();
    advanceTime(3000);

    return p;
}