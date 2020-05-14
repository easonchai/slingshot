pragma solidity >= 0.6.2 < 0.7.0;

interface DeployerInterface {
	//Deployer
	function deploy(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external returns(address payable);
}
