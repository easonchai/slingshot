import actionCreatorFactory from 'typescript-fsa';
import { AppActions } from '../constants';
import { User, Meeting, GroupHashAndAddress, GroupMeetingAndUserAddress, GroupMeetingAndProposal } from '../interfaces';


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
