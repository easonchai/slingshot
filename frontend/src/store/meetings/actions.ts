import actionCreatorFactory from 'typescript-fsa';
import { AppActions } from '../constants';
import { User } from '../users/actions';

export interface Meeting {
    // BACKEND
    txHash: string;
    meetingAddress: string;
    name: string;
    location: string;
    description: string;
    
    users: Array<string>;

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

const actionCreator = actionCreatorFactory();

export const CreateFirstMeeting = actionCreator<Meeting>(AppActions.CREATE_FIRST_MEETING);
export const ReadAllMeetings = actionCreator<Array<Meeting>>(AppActions.READ_ALL_MEETINGS);
export const ReadCachedMeeting = actionCreator<Meeting>(AppActions.READ_CACHED_MEETING);
export const UpdateMeetingContractAddress = actionCreator<GroupHashAndAddress>(AppActions.UPDATE_MEETING_CONTRACT_ADDRESS);
export const UpdateMeetingRSVPList = actionCreator<string>(AppActions.UPDATE_MEETING_RSVP_LIST);

export const actions = {
  CreateFirstMeeting,
  ReadAllMeetings,
  ReadCachedMeeting,
  UpdateMeetingContractAddress,
  UpdateMeetingRSVPList,
};
