import {expect, use} from 'chai';
import {utils, Contract, Wallet} from 'ethers';
import {createFixtureLoader, deployContract, MockProvider, solidity} from 'ethereum-waffle';
import Deployer from '../build/Deployer.json';
import Club from '../build/Club.json';
import Meeting from '../build/Meeting.json';
import * as f from './fixtures';

use(solidity);

describe('deployer unit test', () => {
    
    it('deployer deploys', async () => {
        const {deployer, wallet} = await f.loadFixture(f.deployerFixture);
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
        let p = await f.loadFixture(f.clubFixture);
        club = p.club;
        wallet = p.wallet; 
        //setTimeout(() =>{},10000);
    });

    it('checks new club deployment', async () => {
        expect(await club.totalAdmins()).to.equal(1);
    });

    it('Deploys meeting', async () => {
        let event = (await (await club.deployMeeting(f.start, f.end, 1, 1)).wait()).events.pop();
        expect(event.args.ownerAddr).to.equal(wallet.address);
    });

    it('checks balance', async() => {
        await (await wallet.sendTransaction({to: club.address, gasPrice: 0, value: 10})).wait();
        expect(await club.getBalance()).to.equal(10);
    });

    it('submits proposal to add club admins', async() => {
        await expect(club.proposeAdminChange(club.address, [f.wallet2.address, f.wallet3.address], []))
        .to.emit(club, 'ProposeAdminChange')
        .withArgs(1, club.address, [f.wallet2.address, f.wallet3.address], []);
    });
});

describe('after club Proposal submitted', () => {
    let club: Contract;
    let club2: Contract;
    let wallet: Wallet;
    beforeEach(async () => {
        let p = await f.loadFixture(f.clubProposalFixture);
        club = p.club;
        wallet = p.wallet;
        club2 = p.club.connect(f.wallet2);
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
        let p = await f.loadFixture(f.ProposalApproFixture);
        let club = p.club;
        await expect(club.executeProposal(1))
        .to.emit(club, 'ProposalExecuted')
        .withArgs(club.address, [f.wallet2.address, f.wallet3.address], []);
        await expect(club.executeProposal(1))
        .to.revertedWith('proposal expired');
    });
});

describe('after proposal executed', () => {
    it('checks for new admins', async () => {
        let p = await f.loadFixture(f.ProposalExeFixt);
        let club = p.club.connect(f.wallet2);
        await expect(club.proposeAdminChange(club.address, [f.wallet2.address, f.wallet3.address], []))
        .to.emit(club, 'ProposeAdminChange')
        .withArgs(2, club.address, [f.wallet2.address, f.wallet3.address], []);
    });
});

describe('after meeting deployed', () => {
    let meeting: Contract;
    let meeting2: Contract;
    let meeting3: Contract;
    beforeEach(async() => {
        let p = await f.loadFixture(f.MeetingDeployedFixt);
        meeting = p.meeting;
        meeting2 = meeting.connect(f.wallet2);
        meeting3 = p.meeting.connect(f.wallet3);
    });
    it('RSVPs', async() => {
        await expect(meeting2.rsvp({value:0}))
        .to.revertedWith('Incorrect stake');
        await expect(meeting2.rsvp({value:1}))
        .to.emit(meeting2, 'RSVPEvent')
        .withArgs(f.wallet2.address);
        await expect(meeting2.rsvp({value:1}))
        .to.revertedWith('Already registered');
        await expect(meeting3.rsvp({value:1}))
        .to.emit(meeting3, 'RSVPEvent')
        .withArgs(f.wallet3.address);
        await expect((await meeting.testingCheckStake(f.wallet2.address)).toNumber())
        .to.equal(1);
        await expect((await meeting.testingCheckStake(f.wallet3.address)).toNumber())
        .to.equal(1);
        await expect((await meeting.testingCheckStake(f.wallet.address)).toNumber())
        .to.equal(0);
    });

    it('setStartDate', async() => {
        await expect(meeting.setStartDate(f.start + 1))
        .to.emit(meeting, 'EditStartDateEvent')
        .withArgs(f.start + 1);
        await expect(meeting2.setStartDate(f.start + 1))
        .to.revertedWith('Ownable: caller is not the owner');
        await expect(meeting.setStartDate(f.start + 10000))
        .to.revertedWith('must start before endDate'); 
    });
})

describe('start event', () => {
    let meeting: Contract;
    let meeting2: Contract;
    beforeEach( async() => {
        let p = await f.loadFixture(f.MeetingBeforeStartFixt);
        meeting = p.meeting2.connect(f.wallet);
        meeting2 = p.meeting2;
        console.log(
            (await p.meeting.testingCheckStake(f.wallet.address)).toNumber(),
            (await p.meeting.testingCheckStake(f.wallet2.address)).toNumber(),
            (await p.meeting.testingCheckStake(f.wallet3.address)).toNumber()
            );
    });

    it('starts event at start time', async() => {
        f.advanceTime(f.start - f.testTime + 3);
        await expect(meeting.startEvent())
        .to.emit(meeting, 'StartEvent')
        .withArgs(f.wallet.address);
    });

    it('starts event before start time', async() => {
        f.advanceTime(f.start - f.testTime - 5);
        await expect(meeting.startEvent())
        .to.revertedWith("Can't start out of scope");
    });

    it('starts event after end time', async() => {
        f.advanceTime(f.end - f.start + 1000);
        await expect(meeting.startEvent())
        .to.emit(meeting, 'StartEvent')
        .withArgs(f.wallet.address);
    });

    it('guy cancels before event started', async() => {
        expect(meeting2.guyCancel())
        .to.emit(meeting2, 'GuyCancelled')
        .withArgs(f.wallet2.address);
    })
});

describe('after start', () => {
    let p:any;
    beforeEach( async() => {
        // p = await f.loadFixture(f.MeetingBeforeStartFixt);
        let p = await f.loadFixture(f.MeetingBeforeStartFixt);
        // meeting = p.meeting2.connect(wallet);
        console.log(p.meeting.address, p.meeting2.address, p.meeting3.address);
        console.log(f.wallet.address, f.wallet2.address, f.wallet3.address);
        console.log(
            (await p.meeting.testingCheckStake(f.wallet.address)).toNumber(),
            (await p.meeting.testingCheckStake(f.wallet2.address)).toNumber(),
            (await p.meeting.testingCheckStake(f.wallet3.address)).toNumber()
            );
    });

    it('s', async() => {
        //
    })
    
    
        
    // it('finalise event', async() => {
    //     expect(p.meeting.finaliseEvent(
    //         [f.wallet3.address]
        // ));
    // });
});

//Test total admins for club contract

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