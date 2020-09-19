import actionCreatorFactory from 'typescript-fsa';
import { AppActions } from '../constants';
import { User } from '../users/actions';
import { Club } from '../clubs/actions';

// TODO refactor duplicate
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

export interface Proposal {
  created: number;
  id: number;
  newAdmin: string[];
  oldAdmin: string[];
  voted: number;
  state: string;
}

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
}

const actionCreator = actionCreatorFactory();

export const UpdateOrganiserEthereumAddress = actionCreator<User>(AppActions.UPDATE_ORGANIZER_ETHEREUM_ADDRESS);
export const CreateFirstMeeting = actionCreator<Meeting>(AppActions.CREATE_FIRST_MEETING);
export const ReadAllMeetings = actionCreator<Array<Meeting>>(AppActions.READ_ALL_MEETINGS);
export const ReadCachedMeeting = actionCreator<Meeting>(AppActions.READ_CACHED_MEETING);
export const UpdateMeetingContractAddress = actionCreator<GroupHashAndAddress>(AppActions.UPDATE_MEETING_CONTRACT_ADDRESS);
export const UpdateRSVPList = actionCreator<GroupMeetingAndUserAddress>(AppActions.UPDATE_MEETING_RSVP_LIST);
export const UpdateRSVPListCancellation = actionCreator<GroupMeetingAndUserAddress>(AppActions.UPDATE_MEETING_RSVP_LIST_CANCELLATION);
export const UpdateStartMeeting = actionCreator<string>(AppActions.UPDATE_START_MEETING);
export const UpdateEndMeeting = actionCreator<string>(AppActions.UPDATE_END_MEETING);
export const UpdateCancelMeeting = actionCreator<string>(AppActions.UPDATE_CANCEL_MEETING);
export const UpdateHandleAttendance = actionCreator<GroupMeetingAndUserAddress>(AppActions.UPDATE_HANDLE_ATTENDANCE);
export const UpdateHandleAbsence = actionCreator<GroupMeetingAndUserAddress>(AppActions.UPDATE_HANDLE_ABSENCE);
export const UpdateUserWithdraw = actionCreator<GroupMeetingAndUserAddress>(AppActions.UPDATE_USER_WITHDRAW);
export const CreateNextMeeting = actionCreator<Meeting>(AppActions.CREATE_NEXT_MEETING);
export const PauseMeeting = actionCreator<string>(AppActions.PAUSE_MEETING);
export const AddProposal = actionCreator<GroupMeetingAndProposal>(AppActions.ADD_PROPOSAL);

export const actions = {
  UpdateOrganiserEthereumAddress,
  CreateFirstMeeting,
  ReadAllMeetings,
  ReadCachedMeeting,
  UpdateMeetingContractAddress,
  UpdateRSVPList,
  UpdateRSVPListCancellation,
  UpdateStartMeeting,
  UpdateEndMeeting,
  UpdateCancelMeeting,
  UpdateHandleAttendance,
  UpdateHandleAbsence,
  UpdateUserWithdraw,
  CreateNextMeeting,
  PauseMeeting,
  AddProposal,
};
