export const ModelType = {
  USER: 'user',
  PENDING: 'pending',
  MEETING: 'meeting',
  CLUB: 'club',
};

export interface Feedback {
  meetingAddress: string;
  userAddress: string;
  ensAddress: string;
  comment: string;
  stars: number;
  images: ReadonlyArray<string>;
  videos: ReadonlyArray<string>;
};

export interface User {
  _id: string;
  type: string;
  admins: ReadonlyArray<string>;

  data: {
    ensDomain: string,
    feedback: ReadonlyArray<Feedback>,

    // list of meeting wallets (smart contract address) linked to this user profile per status
    cancel: ReadonlyArray<string>;
    rsvp: ReadonlyArray<string>;
    attend: ReadonlyArray<string>;
    withdraw: ReadonlyArray<string>;
  };
};

export interface Proposal {
  created: number;
  id: number;
  newAdmin: string[];
  oldAdmin: string[];
  voted: number;
  state: string;
};

export interface Club {
  _id: string;
  type: string;
  admins: ReadonlyArray<string>;
  proposals: ReadonlyArray<Proposal>;

  data: {
    name: string;

    deployerContractAddress: string;
    organizerAddress: string;
  },
};

export interface Meeting {
  _id: string;
  type: string;
  admins: ReadonlyArray<string>;
  proposals: ReadonlyArray<Proposal>;

  data: {
    // BACKEND
    //txHash: string;  // only used as primary key for pending TX's
    //meetingAddress: string;  // id is replaced by contract address as primary key once TX is mined
    name: string;
    clubName: string;
    clubAddress: string;
    location: string;
    description: string;

    // SOLIDITY
    startDateTime: number;
    endDateTime: number;
    stake: number;
    maxParticipants: number;
    //registered: number;  // redundant -> rsvp.length + attend.length + withdraw.length
    prevStake: number;
    payout: number;
    //attendanceCount: number;  // redundant -> attend.length + withdraw.length
    isCancelled: boolean;
    isStarted: boolean;
    isEnded: boolean;
    isPaused: boolean;
    deployerContractAddress: string;
    organizerAddress: string;

    parent: string;  // prev meeting
    child: string;  // next meeting

    // Media provided by owner once event is created
    images: ReadonlyArray<string>;
    videos: ReadonlyArray<string>;

    feedback: ReadonlyArray<Feedback>;

    // list of user wallets (ethereum address) linked to this meeting per status
    cancel: ReadonlyArray<string>,
    rsvp: ReadonlyArray<string>,
    attend: ReadonlyArray<string>,
    withdraw: ReadonlyArray<string>
  },
};

export interface GroupHashAndAddress {
  txHash: string;
  meetingAddress: string;
};

export interface GroupMeetingAndUserAddress {
  meetingAddress: string,
  userAddress: string
};

export interface GroupMeetingAndProposal {
  meetingAddress: string,
  proposal: Proposal,
};

export interface Loading {
  cachedMeeting: boolean;
  meetingDeployment: boolean;
  rsvpConfirmation: boolean;
  rsvpCancellationConfirmation: boolean;
  startMeetingConfirmation: boolean;
  endMeetingConfirmation: boolean;
  cancelMeetingConfirmation: boolean;

  markAttendanceConfirmation: boolean;
  markAbsenceConfirmation: boolean;
};