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

const testTime = Math.round(Date.now() / 1000); //in seconds
const start = testTime + 100;
const end = testTime + 1000;
const someProvider = new MockProvider({ganacheOptions:{
    gasLimit: "0x989680"}});

let [wallet, wallet2, wallet3, guy] = someProvider.getWallets();

const advanceTime = async (time: number) => {
    const timeReturn = await someProvider.send(
        'evm_increaseTime', [time]);
  }

const loadFixture = createFixtureLoader([wallet, wallet2, wallet3, guy], someProvider);


async function deployerFixture([wallet, other]: Wallet[], provider: MockProvider) {
    const deployer = await deployContract(wallet, Deployer, [], {gasLimit: "0x989680"});
    return {deployer, wallet, other};
  }; 

async function clubFixture([wallet, other]: Wallet[], provider: MockProvider) {
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

async function clubProposalFixture([wallet, other]: Wallet[], provider: MockProvider) {
    let p = await loadFixture(clubFixture);
    let club = p.club;
    wallet = p.wallet;
    await (await club.proposeAdminChange(club.address, [wallet2.address, wallet3.address], [])).wait();
    return {club, wallet, other};
}

async function ProposalApproFixture([wallet, other]: Wallet[], provider: MockProvider) {
    let p = await loadFixture(clubProposalFixture);
    let club = p.club;
    wallet = p.wallet;
    await (await club.approveProposal(1)).wait();
    return {club, wallet, other};
}

async function ProposalExeFixt([wallet, other]: Wallet[], provider: MockProvider) {
    let p = await loadFixture(ProposalApproFixture);
    let club = p.club;
    wallet = p.wallet;
    await (await club.executeProposal(1)).wait();
    return {club, wallet, other};
}

async function MeetingDeployedFixt([wallet, other]: Wallet[], provider: MockProvider) {
    let p = await loadFixture(clubFixture);
    let club = p.club;
    wallet = p.wallet;
    let meetingAddress = (await (await club.deployMeeting(
        start, end, 1, 3)).wait())
        .events.pop().args.contractAddr;
    let meeting = new Contract(meetingAddress, Meeting.abi, wallet);
    return {meeting, wallet, other};
}

async function MeetingBeforeStartFixt([wallet, other]: Wallet[], provider: MockProvider) {
    let p = await loadFixture(MeetingDeployedFixt);
    let meeting = p.meeting;
    let meeting2 = meeting.connect(wallet2);
    let meeting3 = meeting.connect(wallet3);
    await (await meeting2.rsvp({value:1})).wait();
    await (await meeting3.rsvp({value:1})).wait();
    console.log(wallet2.address, wallet3.address);
    return {meeting, meeting2, meeting3};
};

async function MeetingAfterStartFix([wallet, other]: Wallet[], provider: MockProvider) {
    let p = await loadFixture(MeetingBeforeStartFixt);
    advanceTime(101);
    await (await p.meeting.startEvent()).wait();
    advanceTime(3000);

    return p; 
}



describe('deployer unit test', () => {
    
    it('deployer deploys', async () => {
        const {deployer, wallet} = await loadFixture(deployerFixture);
        let tx = await deployer.deploy();
        let receipt = await tx.wait();
        let event = receipt.events.pop();
        expect(event.args.admin).to.equal(wallet.address);
        });
});

describe('club unit tests', () => {
    let club: Contract;
    let wallet: Wallet;
    beforeEach(async () => {
        let p = await loadFixture(clubFixture);
        club = p.club;
        wallet = p.wallet; 
        //setTimeout(() =>{},10000);
    });

    it('checks new club deployment', async () => {
        expect(await club.totalAdmins()).to.equal(1);
    });

    it('Deploys meeting', async () => {
        let event = (await (await club.deployMeeting(start, end, 1, 1)).wait()).events.pop();
        expect(event.args.ownerAddr).to.equal(wallet.address);
    });

    it('checks balance', async() => {
        await (await wallet.sendTransaction({to: club.address, gasPrice: 0, value: 10})).wait();
        expect(await club.getBalance()).to.equal(10);
    });

    it('submits proposal to add club admins', async() => {
        await expect(club.proposeAdminChange(club.address, [wallet2.address, wallet3.address], []))
        .to.emit(club, 'ProposeAdminChange')
        .withArgs(1, club.address, [wallet2.address, wallet3.address], []);
    });
});

describe('after club Proposal submitted', () => {
    let club: Contract;
    let club2: Contract;
    let wallet: Wallet;
    beforeEach(async () => {
        let p = await loadFixture(clubProposalFixture);
        club = p.club;
        wallet = p.wallet;
        club2 = p.club.connect(wallet2);
    });

    it('approves proposal', async() => {
        await expect(club.approveProposal(1))
        .to.emit(club, 'ApproveProposal')
        .withArgs(1);
        await expect(club.approveProposal(1))
        .to.be.revertedWith('Already approved');
        // Next need to do other votes.
    });

    it('checks that random guy cannot approve', async() => {
        await expect(club2.approveProposal(1))
        .to.be.revertedWith('Not admin');
    });

    it('checks that proposal cannot be executed yet', async () => {
        await expect(club.executeProposal(1))
        .to.be.revertedWith('Quorum not reached');
    })

    // it('checks pause function', async () => {
    //     let meeting = new Contract(club.address, Meeting.abi, wallet);
    //     await club.pause(club.address, Date.now() + 10);
    //     expect('balanceOf').to.be.calledOnContractWith(meeting, [Date.now() + 10]);
    // });
});

describe('After proposal approved', () => {
    it('executes proposal', async () => {
        let p = await loadFixture(ProposalApproFixture);
        let club = p.club;
        await expect(club.executeProposal(1))
        .to.emit(club, 'ProposalExecuted')
        .withArgs(club.address, [wallet2.address, wallet3.address], []);
        await expect(club.executeProposal(1))
        .to.revertedWith('proposal expired');
    });
});

describe('after proposal executed', () => {
    it('checks for new admins', async () => {
        let p = await loadFixture(ProposalExeFixt);
        let club = p.club.connect(wallet2);
        await expect(club.proposeAdminChange(club.address, [wallet2.address, wallet3.address], []))
        .to.emit(club, 'ProposeAdminChange')
        .withArgs(2, club.address, [wallet2.address, wallet3.address], []);
    });
});

describe('after meeting deployed', () => {
    let meeting: Contract;
    let meeting2: Contract;
    beforeEach(async() => {
        let p = await loadFixture(MeetingDeployedFixt);
        meeting = p.meeting;
        meeting2 = meeting.connect(wallet2);
        let meeting3 = p.meeting.connect(wallet3);
    });
    it('RSVPs', async() => {
        await expect(meeting2.rsvp({value:0}))
        .to.revertedWith('Incorrect stake');
        await expect(meeting2.rsvp({value:1}))
        .to.emit(meeting2, 'RSVPEvent')
        .withArgs(wallet2.address);
        await expect(meeting2.rsvp({value:1}))
        .to.revertedWith('Already registered');
    });

    it('setStartDate', async() => {
        await expect(meeting.setStartDate(start + 1))
        .to.emit(meeting, 'EditStartDateEvent')
        .withArgs(start + 1);
        await expect(meeting2.setStartDate(start + 1))
        .to.revertedWith('Ownable: caller is not the owner');
        await expect(meeting.setStartDate(start + 10000))
        .to.revertedWith('must start before endDate'); 
    });
})

describe('start event', () => {
    let meeting: Contract;
    let meeting2: Contract;
    beforeEach( async() => {
        let p = await loadFixture(MeetingBeforeStartFixt);
        meeting = p.meeting2.connect(wallet);
        meeting2 = p.meeting2;
    });

    it('starts event at start time', async() => {
        advanceTime(start - testTime + 3);
        await expect(meeting.startEvent())
        .to.emit(meeting, 'StartEvent')
        .withArgs(wallet.address);
    });

    it('starts event before start time', async() => {
        advanceTime(start - testTime - 5);
        await expect(meeting.startEvent())
        .to.revertedWith("Can't start out of scope");
    });

    it('starts event after end time', async() => {
        advanceTime(end - start + 1000);
        await expect(meeting.startEvent())
        .to.emit(meeting, 'StartEvent')
        .withArgs(wallet.address);
    });

    it('guy cancels before event started', async() => {
        expect(meeting2.guyCancel())
        .to.emit(meeting2, 'GuyCancelled')
        .withArgs(wallet2.address);
    })
});

describe('after start', () => {
    let p:any;
    beforeEach( async() => {
        p = await loadFixture(MeetingAfterStartFix);
        // meeting = p.meeting2.connect(wallet);
    });
    
    
        
    it('finalise event', async() => {
        expect(p.meeting.finaliseEvent(
            [wallet3.address]
        ));
    });
});

//Test total admins for club contract

//Test that event can be started any time after start time.

    it('poolPayout function', () => {
        //Very hard to *unit* test functions that can only be called by a specific contract 
        //In a sense, it's impossible to unit test something that's designed to be used in a very specific way.
        //This means we cannot test any of the payout functions unless as an integration test with another.
        // But it might be worth still putting this unit test in with a fixture since it will show exactly 
        //where the fault is occuring.
        //I.e. any other fault would show an error with the fixture not the test itself.
        
        //However, you can still unit test functions which are designed to be used by any account. 
    });

//Use: 'called on', fixtures, mock contracts