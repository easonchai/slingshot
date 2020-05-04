pragma solidity >= 0.5.0 < 0.7.0;

import "./openzeppelin/Ownable.sol";
import "./openzeppelin/SafeMath.sol";

contract Meeting is Ownable{

    using SafeMath for uint;

    uint public startDate;
    uint public endDate;
    uint public minStake; //should be entered in GWEI by frontend
    uint public registrationLimit;
    uint public registered;
    uint public prevStake;
    uint public payout;
    uint public attendanceCount;
    bool public isCancelled;
    bool public isEnded;
    bool public isActive;

    struct Participant{
        uint32 rsvpDate;
        uint stakedAmount;
        address payable addr;
        bool attended;
    }

    Participant[] public participants;

    mapping (address => Participant) addressToParticipant;

    modifier canWithdraw() {
        require(isEnded || isCancelled, "Can't withdraw before event end");
        _;
    }

    event WithdrawEvent(address addr, uint payout);
    event CancelEvent(address addr);
    event RSVPEvent(address addr, uint stake);
    event EndEvent(address addr, uint attendance);
    event SetStakeEvent(uint stake);
    event EditStartDateEvent(uint timeStamp);
    event EditEndDateEvent(uint timeStamp);
    event EditMaxLimitEvent(uint max);


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
        prevStake = address(this).balance;
    }

    /**@dev Start of functions */

    function rsvp() external payable{
        participants.push(Participant(uint32(now), msg.value, msg.sender, false));

        /*Can store return value of the above function into `RegistrationId` which can be used to uniquely
        identify & distribute QR code (still figuring out if needed and how)*/
    }

    function cancel() external {
        if(msg.sender == owner()){
            //If it is the owner who calls this, it will cancel the event
            isCancelled = true;
            payout = prevStake/registered;
        } else {
            //Participant cancel RSVP
            Participant memory participant = addressToParticipant[msg.sender];

            //Check if RSVP'd within 24 hours
            require((participant.rsvpDate + 1 days) > now, "Can't cancel past 24 hours of registering");
            (msg.sender).transfer(participant.stakedAmount);
        }
    }

    /**@dev Organizer's management functions */
    function markAttendance() external onlyOwner {
        //will pass in a list as parameter and use attendanceCount = list.length;
        require(isActive && isEnded, "Event did not take place");
        
    } 

    function startEvent() external onlyOwner {
        isActive = true;
    }

    function endEvent() external onlyOwner {
        isEnded = true;
        payout = prevStake/attendanceCount;
        emit EndEvent(msg.sender, attendanceCount);
    }

    /**@dev Organizer's `edit event` functions */
    function setStartDate(uint dateTimestamp) external onlyOwner{
        //Check if new date is not within 24 hours of today or less
    }

    function setEndDate(uint dateTimestamp) external onlyOwner{
        //Check if new date is not within 24 hours of today or less && not before start date
    }

    function setMinStake(uint stakeAmt) external onlyOwner{
        minStake = stakeAmt;
        emit SetStakeEvent(stakeAmt);
    }

    function setRegistrationLimit(uint max) external onlyOwner {
        require(max > registrationLimit, "Cant set less than original");
        registrationLimit = max;
        emit EditMaxLimitEvent(max);
    }

    /**@dev Smart Contract's functions */
    function withdraw() external canWithdraw{
        //Either manually withdraw or automatic send back
        require(prevStake > 0, "stake is 0");
        Participant memory participant = addressToParticipant[msg.sender];
        require(participant.attended || isCancelled, "Did not attend");
        (participant.addr).transfer(payout);
        emit WithdrawEvent(msg.sender, payout);
    }

    /**Ben: @dev Deploys next event contract.*/
    function nextEvent(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external {
        //Ben: Deploy next event contract
        //newEventContract.transfer(address(this).balance); //Ben: Send entire ether balance to new contract.
    }

    //Temp function for testing
    function getBalance() external view returns (uint){
        return address(this).balance;
    }
}