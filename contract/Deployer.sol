pragma solidity >= 0.5.0 < 0.7.0;

import './Meeting.sol';

contract Deployer{

	Meeting public meeting;

	function deploy(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external {

		meeting = new Meeting(_startDate, _endDate, _minStake, _registrationLimit, address(this));

	}

}