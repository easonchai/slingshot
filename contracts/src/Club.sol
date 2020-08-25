pragma solidity >= 0.6.2 < 0.7.0;

import './Meeting.sol';

contract Club{

	using SafeMath for uint;

	event NewMeetingEvent(address ownerAddr, address contractAddr);
	event ProposalExecuted(address payable target, address payable[] addAdmins, address payable[] removeAdmins);
	event ProposeAdminChange(uint counter, address payable target, address payable[] addAdmins, address payable[] removeAdmins);
	event ApproveProposal(uint proposal);
	event PoolPayout(uint amount);

	mapping (address => bool) isMeeting; //Records legitimate meeting addresses

	mapping (address => bool) isAdmin; //Records list of admins who can create new meetings

	uint public totalAdmins;

	struct Proposal{
		address payable target;
		address payable[] addAdmins;
		address payable[] removeAdmins;
		uint totalInFavour;
		mapping(address => bool) isInFavour;
		uint creationTime;
	}

	mapping (uint => Proposal) proposal;

	uint public proposalCounter;

	modifier onlyAdmin(){
		require(isAdmin[msg.sender] == true, 'Not admin');
		_;
	}

	constructor (address _firstAdmin) public{
		isAdmin[_firstAdmin] = true;
		totalAdmins = 1;
	}

	receive() external payable {}


	function deployMeeting(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external onlyAdmin returns(address) {
		require(now < _startDate, 'Event in past');
		require(_startDate < _endDate, 'End before start');
		address meeting = address(new Meeting(_startDate, _endDate, _minStake, _registrationLimit, msg.sender));
		isMeeting[meeting] = true;
		emit NewMeetingEvent(msg.sender, meeting);
		return meeting;
	}

	function poolPayout(uint _amount) external {
		require (isMeeting[msg.sender] = true, 'Not a meeting or already paid out');
		isMeeting[msg.sender] = false;
		msg.sender.transfer(_amount);
		emit PoolPayout(_amount);
	}

	function getBalance() external view returns (uint){
        return address(this).balance;
    }
 

	function approveProposal(uint _proposal) external onlyAdmin {
		require (proposal[_proposal].isInFavour[msg.sender] == false, 'Already approved');
		proposal[_proposal].isInFavour[msg.sender] = true;
		proposal[_proposal].totalInFavour++;
		emit ApproveProposal(_proposal);
	}


	function executeProposal(uint _proposal) external onlyAdmin {
		//Check vote totals
		Proposal memory p = proposal[_proposal];
		require(now < p.creationTime + 7 days, 'proposal expired'); //Proposal expires after 7 days.
		require(p.totalInFavour.mul(5) >= totalAdmins.mul(4), 'Quorum not reached'); //Require at least 4/5 admins to approve proposal.  
		proposal[_proposal].creationTime = now - 7 days; //Stops proposals from being executed twice.
		if (p.target == address(this)){
			for (uint i=0; i<p.addAdmins.length; i++) {
				require(isAdmin[p.addAdmins[i]] == false, 'already admin');
				isAdmin[p.addAdmins[i]] = true;
			}
			for (uint i=0; i<p.removeAdmins.length; i++) {
				require(isAdmin[p.addAdmins[i]] == true, 'already non-admin');
				isAdmin[p.removeAdmins[i]] = false;
			}
			totalAdmins = totalAdmins.add(p.addAdmins.length).sub(p.removeAdmins.length);

		} else{
			require(isMeeting[p.target] == true, 'Invalid meeting');
			Meeting(p.target).unPause(p.addAdmins[0]); //Meeting ownership transferred.
		}
		emit ProposalExecuted(p.target, p.addAdmins, p.removeAdmins);
		

	}

	function proposeAdminChange(address payable _target, address payable[] calldata _addAdmins, address payable[] calldata _removeAdmins) external onlyAdmin{
		//Store proposal
		uint counter = ++proposalCounter;
		
		proposal[counter].target = _target;
		proposal[counter].addAdmins = _addAdmins;
		proposal[counter].removeAdmins = _removeAdmins;
		proposal[counter].creationTime = now;
		
		emit ProposeAdminChange(counter, _target, _addAdmins, _removeAdmins);	
	}

	function pause(address payable _meeting, uint _pauseUntil) external onlyAdmin {
		//Stops all functions in the _meeting contract for _duration amount of time.
		require(_pauseUntil.sub(now) < 7 days);
		Meeting(_meeting).pause(_pauseUntil);

	}

}
