import actionCreatorFactory from 'typescript-fsa';
import { AppActions } from '../constants';

// TODO refactor duplicate
export const ModelType = {
  USER: 'user',
  MEETING: 'meeting',
  PENDING: 'pending'
};

export interface Meeting {
  _id: string,
  type: string,
  
  data: {
    // BACKEND
    //txHash: string;  // only used as primary key for pending TX's
    //meetingAddress: string;  // id is replaced by contract address as primary key once TX is mined
    name: string;
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
    deployerContractAddress: string;
    organizerAddress: string;
  },

  parent: string,  // prev meeting
  child: string,  // next meeting

  // list of user wallets (ethereum address) linked to this meeting per status
  cancel: ReadonlyArray<string>,
  rsvp: ReadonlyArray<string>,
  attend: ReadonlyArray<string>,
  withdraw: ReadonlyArray<string>
};

export interface GroupHashAndAddress {
  txHash: string;
  meetingAddress: string;
};

export interface GroupMeetingAndUserAddress {
  meetingAddress: string,
  userAddress: string
};

const actionCreator = actionCreatorFactory();

export const CreateFirstMeeting = actionCreator<Meeting>(AppActions.CREATE_FIRST_MEETING);
export const ReadAllMeetings = actionCreator<Array<Meeting>>(AppActions.READ_ALL_MEETINGS);
export const ReadCachedMeeting = actionCreator<Meeting>(AppActions.READ_CACHED_MEETING);
export const UpdateMeetingContractAddress = actionCreator<GroupHashAndAddress>(AppActions.UPDATE_MEETING_CONTRACT_ADDRESS);
export const UpdateRSVPList = actionCreator<GroupMeetingAndUserAddress>(AppActions.UPDATE_MEETING_RSVP_LIST);

export const actions = {
  CreateFirstMeeting,
  ReadAllMeetings,
  ReadCachedMeeting,
  UpdateMeetingContractAddress,
  UpdateRSVPList,
};
