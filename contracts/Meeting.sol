pragma solidity >= 0.6.2 < 0.7.0;

import "./openzeppelin/Ownable.sol";
import "./openzeppelin/SafeMath.sol";
import './DeployerInterface.sol';
import './MeetingInterface.sol';

contract Meeting is Ownable {

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
    bool public isActive; //Event started.
    address parentAddress; //Address of deployer contract.
    address prevMeeting; //Address of the previous meeting contract.


    struct Participant{
        uint32 rsvpDate;
        uint stakedAmount;
        bool attended;
    }

    mapping (address => Participant) addressToParticipant;

    DeployerInterface public deployer;
    MeetingInterface public meeting;

    event EventCancelled();
    event GetChange();
    event GuyCancelled(address participant);
    event MarkAttendance(address _participant);
    event WithdrawEvent(address addr, uint payout);
    event RSVPEvent(address addr);
    event StartEvent(address addr);
    event EndEvent(address addr, uint attendance);
    event SetStakeEvent(uint stake);
    event EditStartDateEvent(uint timeStamp);
    event EditEndDateEvent(uint timeStamp);
    event EditMaxLimitEvent(uint max);
    event Refund(address addr, uint refund);
    event NextMeeting(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit, address _nextMeeting);
    event SetPrevStake(uint prevStake);
    event SendStake(uint _amnt);

    modifier notActive() {
        require(!isActive, 'Event started');
        _;
    }
    
    modifier notCancelled() {
        require(!isCancelled, 'Event cancelled');
        _;
    }
    
    modifier duringEvent() {
        require(isActive && !isEnded, "Event not happening");
        _;
    }

    /**
       @dev Constructor explanation
       @param _startDate - The date the event starts
       @param _endDate - The date the event is expected to end
       @param _minStake - Minimum each participant is required to stake
       @param _registrationLimit - Max attendees
     */

    constructor (
        uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit, address _parentAddress, address _prevMeeting) public {
        startDate = _startDate;
        endDate = _endDate;
        minStake = _minStake;
        registrationLimit = _registrationLimit;
        parentAddress = _parentAddress; //For deployment of next event contract.
        prevMeeting = _prevMeeting;
    }

    /**@dev Start of functions */

    function rsvp() external payable{
        uint amnt = addressToParticipant[msg.sender].stakedAmount; 
        require(amnt < minStake, 'Already registered');
        require(msg.value.add(amnt) == minStake, 'Incorrect stake');
        require(registered < registrationLimit, 'Limit reached');
        addressToParticipant[msg.sender] = Participant(uint32(now), msg.value, false);
        registered++;
        /*Can store return value of the above function into `RegistrationId` which can be used to uniquely
        identify & distribute QR code (still figuring out if needed and how)*/
        emit RSVPEvent(msg.sender);
    }

    function getChange() external{
        uint amnt = addressToParticipant[msg.sender].stakedAmount;
        require(amnt > 0);
        msg.sender.transfer(amnt.sub(minStake)); //Give change if user has overpaid. This can be done before or after the event.
    
        emit GetChange();
    }

    function eventCancel() external notActive onlyOwner notCancelled{
        //If it is the owner who calls this, it will cancel the event
        isCancelled = true;
        minStake = 0; //This allows refunds to be claimed through getChange()
        if (address(meeting) != address(0)){ //Send stake to new event if it has been created.
            sendStake(prevStake);
        }
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
    function markAttendance(address _participant) external onlyOwner duringEvent{
        //will pass in a list as parameter and use attendanceCount = list.length;
        Participant memory participant = addressToParticipant[_participant];
        require(participant.attended == false, 'already marked');
        require(participant.stakedAmount >= minStake, 'Stake too low');
        addressToParticipant[_participant].attended = true;
        attendanceCount++;
        emit MarkAttendance(_participant);
    }

    function startEvent() external onlyOwner notActive notCancelled{
        require(startDate < now && now < endDate, "Can't start out of scope");
        //Not sure we need but means organiser cannot start event at arbitrary times.
        isActive = true;
        emit StartEvent(msg.sender); //Maybe not necessary to msg.sender
    }

    function endEvent() external onlyOwner duringEvent{
        isEnded = true;
        payout = prevStake.div(attendanceCount);
        if (address(meeting) != address(0)){
            sendStake(address(this).balance.sub(prevStake));
        } 
        emit EndEvent(msg.sender, attendanceCount); //Maybe not necessary to msg.sender
    }

    /**@dev Organizer's `edit event` functions */
    function setStartDate(uint dateTimestamp) external onlyOwner notActive{
        //Check if new date is not within 24 hours of today or less
        require(dateTimestamp > now.add(24 hours), 'Within 24 hours of event');
        startDate = dateTimestamp;
        emit EditStartDateEvent(dateTimestamp);
    }

    function setEndDate(uint dateTimestamp) external onlyOwner notActive{
        //Check if new date is not within 24 hours of today or less && not before start date
        require(dateTimestamp > now.add(24 hours), 'Within 24 hours of event');
        require(dateTimestamp > startDate, 'End must be after start');
        endDate = dateTimestamp;
        emit EditEndDateEvent(dateTimestamp);
    }

    function setMinStake(uint stakeAmt) external onlyOwner notActive{
        require(startDate > now.add(24 hours), 'Within 24 hours of event');
        if (minStake < stakeAmt){
            registered = 0; //All participants need to increase stake.
            } 
        minStake = stakeAmt;
        emit SetStakeEvent(stakeAmt);
    }

    function setRegistrationLimit(uint max) external onlyOwner notActive{
        require(max >= registered, "Cant set less than registered");
        //Ben: no reason for admin to not be able to lower limit if less than registered I think.
        registrationLimit = max;
        emit EditMaxLimitEvent(max);
    }

    /**@dev Smart Contract's functions */
    function withdraw() external {
        //Either manually withdraw or automatic send back
        require(addressToParticipant[msg.sender].attended, "Did not attend");
        require(payout != 0, 'no payout');
        msg.sender.transfer(payout);
        addressToParticipant[msg.sender].attended = false;
        emit WithdrawEvent(msg.sender, payout);
    }

    /**@dev Deploys next event contract.*/
    function nextMeeting(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external onlyOwner returns(address) { //Or internal
        //Cooldown period not necessary since we want owner to, at any time, be able to create chains of events.
        require(address(meeting) == address(0), 'Only be called once');
        deployer = DeployerInterface(parentAddress); //Define deployer contract.
        meeting = MeetingInterface(deployer.deploy(_startDate, _endDate, _minStake, _registrationLimit)); //Deploy next event contract
        if (isEnded){
            sendStake(address(this).balance.sub(prevStake));
        }
        if (isCancelled){
            sendStake(prevStake);
        }
        emit NextMeeting (_startDate, _endDate, _minStake, _registrationLimit, address(meeting));
        return address(meeting);
    }

    //@dev This function is called by the previous contract to set the stake amount.
    function setPrevStake(uint _prevStake) external payable {
        require(msg.sender == prevMeeting, 'Sender != prevMeeting');
        prevStake = _prevStake;
        emit SetPrevStake(prevStake);
    }

    function sendStake(uint _amnt) internal {
        if (_amnt != 0){ //Send current balance minus prevStake to new contract.
            meeting.setPrevStake(_amnt);
        }
        
        emit SendStake(_amnt);
    }

    function destroyAndSend(address payable _recipient) onlyOwner public {
        selfdestruct(_recipient);
    }

    //Temp function for testing
    function getBalance() external view returns (uint){
        return address(this).balance;
    }
}