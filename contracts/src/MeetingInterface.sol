pragma solidity >= 0.6.2 < 0.7.0;

interface MeetingInterface {
	//Ownable
	function owner() public view returns (address);

	//Meeting
	function rsvp() external payable;
	function getChange() external;
	function eventCancel() external;
	function guyCancel() external;
	function startEvent() external;
	function finaliseEvent(address payable[] calldata _participants) external;
	function setStartDate(uint dateTimestamp) external;
	function setEndDate(uint dateTimestamp) external;
	function setRequiredStake(uint stakeAmt) external;
	function setRegistrationLimit(uint max) external;
	function withdraw() external;
	function destroyAndSend() external;
	function pause(uint _pausedUntil) external;
	function unPause(address _newOwner) external;
	function getBalance() external view returns (uint);
}

