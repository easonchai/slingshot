pragma solidity >= 0.6.2 < 0.7.0;

import './Club.sol';

contract Deployer{

	event NewClub(address admin, address clubAddress);

	Club public club;

	function deploy() external returns(address){
		club = new Club(msg.sender);
		emit NewClub(msg.sender, address(club));
		return address(club);
	}
}

