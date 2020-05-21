pragma solidity >= 0.6.2 < 0.7.0;

interface ClubInterface{
	function deployMeeting(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external;
	function poolPayout(uint _amount) external;
	function getBalance() external view returns (uint);
	function approveProposal(uint _proposal) external;
	function executeProposal(uint _proposal) external;
	function proposeAdminChange(address _target, address[] _addAdmins, address[] _removeAdmins) external;
	function pause(address _meeting, uint _pauseUntil) external;
}