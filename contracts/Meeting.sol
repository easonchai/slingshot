pragma solidity >= 0.6.2 < 0.7.0;

import "./openzeppelin/Ownable.sol";
import "./openzeppelin/SafeMath.sol";
import 'ClubInterface.sol';

contract Meeting is Ownable {

    using SafeMath for uint;

    uint public startDate;
    uint public endDate;
    uint public requiredStake; 
    uint public registrationLimit;
    uint public registered;
    uint public payout;
    uint public attendanceCount;
    bool public isCancelled;
    bool public isFinalised;
    bool public isActive; //Event started.
    bool public pausedUntil;


    struct Participant{
        uint32 rsvpDate;
        uint stakedAmount;
        bool attended;
    }

    mapping (address => Participant) addressToParticipant;

    ClubInterface public club;

    event EventCancelled();
    event GetChange();
    event GuyCancelled(address participant);
    event MarkAttendance(address _participant);
    event WithdrawEvent(address addr, uint payout);
    event RSVPEvent(address addr);
    event StartEvent(address addr);
    event EndEvent(address addr, uint attendance, uint meetingPool, uint clubPool);
    event SetStakeEvent(uint stake);
    event EditStartDateEvent(uint timeStamp);
    event EditEndDateEvent(uint timeStamp);
    event EditMaxLimitEvent(uint max);
    event Refund(address addr, uint refund);
    event Pause(uint pausedUntil);

    modifier notActive() {
        require(!isActive, 'Event started');
        _;
    }
    
    modifier notCancelled() {
        require(!isCancelled, 'Event cancelled');
        _;
    }
    
    modifier duringEvent() {
        require(isActive && !isFinalised, "Event not happening or already happened");
        _;
    }

    modifier notPaused() {
        require(now > pausedUntil, 'Event is paused')
        _;
    }

    /**
       @dev Constructor explanation
       @param _startDate - The date the event starts
       @param _endDate - The date the event is expected to end
       @param _requiredStake - Minimum each participant is required to stake
       @param _registrationLimit - Max attendees
     */

    constructor (
        uint _startDate, uint _endDate, uint _requiredStake, uint _registrationLimit, address _parentAddress, address _prevMeeting) public {
        startDate = _startDate;
        endDate = _endDate;
        requiredStake = _requiredStake;
        registrationLimit = _registrationLimit;
        club = Club(msg.sender);
    }

    receive() external payable {}

    /**@dev Start of functions */

    function rsvp() external payable notPaused{
        uint amnt = addressToParticipant[msg.sender].stakedAmount;
        require(!isEnded, 'Event finished');
        require(amnt < requiredStake, 'Already registered');
        require(msg.value.add(amnt) == requiredStake, 'Incorrect stake');
        require(registered < registrationLimit, 'Limit reached');
        addressToParticipant[msg.sender] = Participant(uint32(now), msg.value, false);
        registered++;
        /*Can store return value of the above function into `RegistrationId` which can be used to uniquely
        identify & distribute QR code (still figuring out if needed and how)*/
        emit RSVPEvent(msg.sender);
    }

    function getChange() external notPaused{
        uint amnt = addressToParticipant[msg.sender].stakedAmount;
        require(amnt > 0);
        msg.sender.transfer(amnt.sub(requiredStake)); //Give change if user has overpaid. This can be done before or after the event.
    
        emit GetChange();
    }

    function eventCancel() public notActive onlyOwner notCancelled{
        //If it is the owner who calls this, it will cancel the event
        isCancelled = true;
        requiredStake = 0; //This allows refunds to be claimed through getChange()
        emit EventCancelled();
    }
    
    function guyCancel() external notActive notCancelled {
        //Participant cancel RSVP
        Participant memory participant = addressToParticipant[msg.sender];
        require (participant.stakedAmount != 0, 'Guy cancelled'); 

        //Check if RSVP'd within 24 hours
        require(participant.rsvpDate + 1 days > now, "1 day notice");
        msg.sender.transfer(participant.stakedAmount);
        addressToParticipant[msg.sender].stakedAmount = 0;
        registered--;
        emit GuyCancelled(msg.sender);
    }

    /**@dev Organizer's management functions */
    function markAttendance(address _participant) external onlyOwner duringEvent notPaused{
        //will pass in a list as parameter and use attendanceCount = list.length;
        Participant memory participant = addressToParticipant[_participant];
        require(participant.attended == false, 'already marked');
        require(participant.stakedAmount >= requiredStake, 'Stake too low');
        addressToParticipant[_participant].attended = true;
        attendanceCount++;
        emit MarkAttendance(_participant);
    }

    function startEvent() external onlyOwner notActive notCancelled notPaused{
        require(startDate < now && now < endDate, "Can't start out of scope");
        //Means organiser cannot start event at arbitrary times.
        isActive = true;
        emit StartEvent(msg.sender); //Maybe not necessary to msg.sender
    }

    function finaliseEvent() external onlyOwner duringEvent notPaused{
        require(now > endDate.add(7 days), 'Cooldown period.');
        if (attendanceCount == 0){
            isActive = false;
            eventCancel();
        }else{
            isEnded = true;
            uint memory clubPool = club.getBalance();
            uint memory meetingPool = address(this).balance;
            payout = clubPool.div(attendanceCount);
            if (meetingPool > clubPool){ //Set balance to current club balance.
                club.transfer(meetingPool.sub(clubPool));
            }
            if (meetingPool < clubPool) {
                club.poolPayout(clubPool.sub(meetingPool));
            }    
        }
            emit EndEvent(msg.sender, attendanceCount, meetingPool, clubPool); //Maybe not necessary to msg.sender
    }

    /**@dev Organizer's `edit event` functions */
    function setStartDate(uint dateTimestamp) external onlyOwner notActive notPaused{
        //Check if new date is not within 24 hours of today or less
        require(dateTimestamp > now.add(24 hours), 'Within 24 hours of event');
        startDate = dateTimestamp;
        emit EditStartDateEvent(dateTimestamp);
    }

    function setEndDate(uint dateTimestamp) external onlyOwner notActive notPaused notCancelled{
        //Check if new date is not within 24 hours of today or less && not before start date
        require(startDate> now.add(24 hours), 'Within 24 hours of event');
        require(dateTimestamp > now, 'Cannot set in the past.')
        require(dateTimestamp > startDate, 'End must be after start');
        endDate = dateTimestamp;
        emit EditEndDateEvent(dateTimestamp);
    }

    function setRequiredStake(uint stakeAmt) external onlyOwner notActive notPaused{
        require(startDate > now.add(24 hours), 'Within 24 hours of event');
        if (requiredStake < stakeAmt){
            registered = 0; //All participants need to increase stake.
            } 
        requiredStake = stakeAmt;
        emit SetStakeEvent(stakeAmt);
    }

    function setRegistrationLimit(uint max) external onlyOwner notActive notPaused{
        require(max >= registered, "Cant set less than registered");
        //Ben: no reason for admin to not be able to lower limit if less than registered I think.
        registrationLimit = max;
        emit EditMaxLimitEvent(max);
    }

    /**@dev Smart Contract's functions */
    function withdraw() external notPaused{
        //Either manually withdraw or automatic send back
        require(addressToParticipant[msg.sender].attended, "Did not attend");
        require(payout != 0, 'no payout');
        msg.sender.transfer(payout);
        addressToParticipant[msg.sender].attended = false;
        emit WithdrawEvent(msg.sender, payout);
    }

    function destroyAndSend() onlyOwner external notPaused{
        require(now >endDate.add(14 days), 'Within cooldown period');  //Cooldown period 14 days. setEndDate() is limited to prevent early destruction.
        selfdestruct(address(club)); //This sends users leftover balances to club contract.
    }

    function pause(uint _pausedUntil) external onlyClub{
        pausedUntil = _pausedUntil;
        emit Pause(_pausedUntil);
    }

    function unPause(address _newOwner) external onlyClub{
        transferOwnership(_newOwner);
        pauseUntil = now;
        emit Pause(_pausedUntil);
    } 

    //Temp function for testing
    function getBalance() external view returns (uint){
        return address(this).balance;
    }
}
