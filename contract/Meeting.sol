pragma solidity >= 0.5.0 < 0.7.0;

import "./openzeppelin/Ownable.sol";
import "./openzeppelin/SafeMath.sol";

contract Meeting is Ownable{

    using SafeMath for uint;

    uint public startDate;
    uint public endDate;
    uint public minStake;
    uint public registrationLimit;
    uint public registered;
    bool public isCancelled;
    bool public isEnded;
    bool public isActive;
    address payable owner;

    struct Participant{
        uint32 rsvpDate;
        uint stakedAmount;
        address payable addr;
    }

    Participant[] public participants;

    mapping (uint => bool) public attendanceMap;


    /**
       @dev Constructor explanation
       @param _startDate - The date the event starts
       @param _endDate - The date the event is expected to end
       @param _minStake - Minimum each participant is required to stake
       @param _registrationLimit - Max attendees
     */

    constructor (
        uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit
    ) public {
        startDate = _startDate;
        endDate = _endDate;
        minStake = _minStake;
        registrationLimit = _registrationLimit;
    }

    /**@dev Start of functions */

    function rsvp() external payable{
        participants.push(Participant(uint32(now), msg.value, msg.sender));

        /*Can store return value of the above function into `RegistrationId` which can be used to uniquely
        identify & distribute QR code (still figuring out if needed and how)*/
    }

    function cancel() external {
        if(msg.sender == owner){
            //If it is the owner who calls this, it will cancel the event
            isCancelled = true;
        } else {
            //Participant cancel RSVP
            for(uint i = 0; i<participants.length; i++){
                //Do check here if the msg.sender is a participant
                //Also check if rsvpDate + 1 days is after `now`
            }
            require(registered == 5, "random");
        }
    }

    /**@dev Organizer's management functions */
    function markAttendance() external onlyOwner {

    } 

    function startEvent() external onlyOwner {

    }

    function endEvent() external onlyOwner {

    }

    /**@dev Organizer's `edit event` functions */
    function setStartDate(uint dateTimestamp) external onlyOwner{
        //Check if new date is not within 24 hours of today or less
    }

    function setEndDate(uint dateTimestamp) external onlyOwner{
        //Check if new date is not within 24 hours of today or less && not before start date
    }

    function setMinStake(uint stakeAmt) external onlyOwner{
        
    }

    function setRegistrationLimit(uint max) external onlyOwner {
        //Check if new limit is less than 'registered'
    }

    /**@dev Smart Contract's functions */
    function withdraw() external {
        //Either manually withdraw or automatic send back
    }
}