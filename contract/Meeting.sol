pragma solidity >= 0.6.0 < 0.7.0;

import "./openzeppelin/Ownable.sol";
import "./openzeppelin/SafeMath.sol";
import './DeployerInterface.sol';

contract Meeting is Ownable{

    using SafeMath for uint;

    uint public startDate; //Ben: Would time rather than date be better here?
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
    address parentAddress; //For deployment of next event contract.

    struct Participant{
        uint32 rsvpDate;
        uint stakedAmount;
        address payable addr;
        bool attended;
    }

    mapping (address => Participant) addressToParticipant;

    DeployerInterface public deployer;

    modifier canWithdraw() {
        require(isEnded || isCancelled, "Can't withdraw before event end");
        _;
    }

    event WithdrawEvent(address addr, uint payout);
    event CancelEvent(address addr);
    event RSVPEvent(address addr, uint stake);
    event StartEvent(address addr);
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
        uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit, address _parentAddress) public {
        startDate = _startDate; //Ben: Would time rather than date be better here?
        endDate = _endDate;
        minStake = _minStake;
        registrationLimit = _registrationLimit;
        prevStake = address(this).balance;
        parentAddress = _parentAddress; //For deployment of next event contract.
    }

    /**@dev Start of functions */

    function rsvp() external payable{
        require(msg.value >= minStake * 1 wei * 10**9, 'Stake too low');
        require(registered < registrationLimit, 'Limit reached');
        addressToParticipant[msg.sender] = Participant(uint32(now), msg.value, msg.sender, false);
        registered++;
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
            require((participant.rsvpDate + 1 days) > now, "Can't cancel 24 hours after registering");
            (msg.sender).transfer(participant.stakedAmount);
        }
    }

    /**@dev Organizer's management functions */
    function markAttendance(address _participant) external onlyOwner {
        //will pass in a list as parameter and use attendanceCount = list.length;
        require(isActive && isEnded, "Event did not take place");
        addressToParticipant[_participant].attended = true;
        attendanceCount++;
    }

    function startEvent() external onlyOwner {
        require(startDate <= now && now < endDate, "Cant start out of scope");
        //Not sure we need but means organiser cannot start event at arbitrary times.
        isActive = true;
        emit StartEvent(msg.sender);
    }

    function endEvent() external onlyOwner {
        require(isActive, "Event not started");
        isEnded = true;
        payout = prevStake/attendanceCount;
        emit EndEvent(msg.sender, attendanceCount);
    }

    /**@dev Organizer's `edit event` functions */
    function setStartDate(uint dateTimestamp) external onlyOwner{
        //Check if new date is not within 24 hours of today or less
        require(dateTimestamp > now + 24 hours, 'Within 24 hours of event');
        startDate = dateTimestamp;
        emit EditStartDateEvent(dateTimestamp);
    }

    function setEndDate(uint dateTimestamp) external onlyOwner{
        //Check if new date is not within 24 hours of today or less && not before start date
        require(dateTimestamp > now + 24 hours, 'Within 24 hours of event');
        require(dateTimestamp > startDate, 'End must be after start');
        endDate = dateTimestamp;
        emit EditEndDateEvent(dateTimestamp);
    }

    function setMinStake(uint stakeAmt) external onlyOwner{
        minStake = stakeAmt;
        emit SetStakeEvent(stakeAmt);
    }

    function setRegistrationLimit(uint max) external onlyOwner {
        require(max >= registered, "Cant set less than registered");
        //Ben: no reason for admin to not be able to lower limit if less than registered I think.
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

    /**@dev Deploys next event contract.*/
    function nextEvent(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external onlyOwner returns(uint) { //Or internal
        deployer = DeployerInterface(parentAddress); //Define deployer contract.
        address payable targetAddress = deployer.deploy(_startDate, _endDate, _minStake, _registrationLimit); //Deploy next event contract
        deployer.transfer(targetAddress, address(this).balance); //Send entire ether balance to new contract.
    }

    //Temp function for testing
    function getBalance() external view returns (uint){
        return address(this).balance;
    }
}