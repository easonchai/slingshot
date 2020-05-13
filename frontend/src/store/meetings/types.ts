export interface Meeting {
    // BACKEND
    txHash: string;
    meetingAddress: string;
    name: string;
    location: string;
    description: string;
  
    // SOLIDITY
    startDateTime: number;
    endDateTime: number;
    stake: number;
    maxParticipants: number;
    registered: number;
    prevStake: number;
    payout: number;
    attendanceCount: number;
    isCancelled: boolean;
    isStarted: boolean;
    isEnded: boolean;
    deployerContractAddress: string;
    organizerAddress: string;
  }

  export interface GroupHashAndAddress {
    txHash: string;
    meetingAddress: string;
  }