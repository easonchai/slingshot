pragma solidity >= 0.5.0 < 0.7.0;

interface MeetingInterface {
	//Ownable
	function renounceOwnership() external;
	function transferOwnership(address newOwner) external;

	//Meeting
	function rsvp() external payable;
	function cancel() external;
	function markAttendance(address _participant) external;
	function startEvent() external;
	function endEvent() external;
	function setStartDate(uint dateTimestamp) external;
	function setEndDate(uint dateTimestamp) external;
	function setMinStake(uint stakeAmt) external;
	function setRegistrationLimit(uint max) external;
	function withdraw() external;
	function nextEvent(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external;
	function getBalance() external view returns (uint);

}