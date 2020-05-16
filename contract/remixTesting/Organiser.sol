pragma solidity >= 0.6.2 < 0.7.0;

import './Deployer.sol';
//import './Participant.sol';

contract Organiser{
    Deployer public deployer;
    Meeting public meeting1;
    Meeting public meeting2;
    Participant public participant;
    
    uint public startDate;
    uint public endDate;
    uint public minStake; 
    uint public registrationLimit;
    
    constructor() public payable{
        deployer = new Deployer();
        startDate = now;
        endDate= now + 2 hours;
        minStake = 1;
        registrationLimit = 1;
        createEvent();
        }
        
    function createEvent() public{
        deployer.deploy(startDate, endDate, minStake, registrationLimit);
        meeting1 = deployer.meeting(); //Meeting(addr);
        //payable(address(participant)).transfer(0);
    }
    
     //dev needs to manually reset owner
    
    function meetingRun(Meeting _meeting) public{ //startDate must be now
        participant = new Participant(_meeting, startDate, endDate, minStake, registrationLimit);
        participant.RSVP{value:50}();
        _meeting.startEvent();
        _meeting.markAttendance(address(participant));
        //meeting.nextMeeting(startDate, endDate, minStake, registrationLimit);
        _meeting.endEvent();
    }
    
    ///////////////////////////////////////////
    
    function meetingRun1() public{
        meetingRun(meeting1);
    }
    
    function cancelledEventRun1() public {
        meeting1.eventCancel();
        participant.getChange();
    }
    
    function afterEvent() public{
        participant.withdraw();
    }
    
    function nextEvent() public {
        meeting1.nextMeeting(now, now + 1 days, minStake, registrationLimit);
        meeting2 = deployer.meeting();
    }
    
    /////////////////////////Event 2///////////////////////
    function setParticipant() public{
        participant.setMeeting(meeting2);
    }
    
    function meetingRun2() public{
        meetingRun(meeting2);
    }
    
    function cancelledEventRun2() public {
        meeting2.eventCancel();
        participant.getChange();
    }
    
    function resetAll() public {
        meeting2.setStartDate(now + 3 days);
        meeting2.setEndDate(now + 4 days);
        meeting2.setMinStake(3);
        meeting2.setRegistrationLimit(4);
    }
    
    
    function destruct() public {
        meeting1.destroyAndSend(payable(address(this)));
    }
    
    /////BOTH EVENTS/////
        //reset ownership
    function full_run1() public{
        meetingRun1();
        nextEvent();
    }
        //reset ownership
    function full_run2() public{
        setParticipant();
        meetingRun2();
        participant.withdraw();
    }
        
    
    
}


contract Participant{
    Meeting public meeting;
    
    uint public startDate;
    uint public endDate;
    uint public minStake; 
    uint public registrationLimit;
    
    constructor (Meeting _meeting, uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) public{
        meeting = _meeting;
        startDate = _startDate;
        endDate = _endDate;
        minStake = _minStake;
        registrationLimit = _registrationLimit;
        }
        
    //Fallback
    receive() external payable {}
        
    function RSVP() public payable{
        meeting.rsvp{value:minStake}();
    }
    
    function withdraw() public{
        meeting.withdraw();
    }
    
    function getChange() public{
        meeting.getChange();
    }
    
    function guyCancel() public{
        meeting.guyCancel();
    }
    
    function setMeeting(Meeting _meeting) public {
        meeting = _meeting;
    }
        

    
    
}