pragma solidity >= 0.6.2 < 0.7.0;

import './Club.sol';

contract Deployer{

	event NewMeetingEvent(address ownerAddr, address contractAddr);

	Meeting public meeting;

	function deploy(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external returns(address){
		meeting = new Meeting(_startDate, _endDate, _minStake, _registrationLimit, address(this), msg.sender);
		emit NewMeetingEvent(msg.sender, address(meeting));
		return address(meeting);
	}
}
