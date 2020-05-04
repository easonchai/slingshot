pragma solidity >= 0.5.0 < 0.7.0;

interface DeployerInterface {
	//Deployer
	function deploy(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external returns(address);
	function transfer(address targetAddress, uint transferAmt) external;
}