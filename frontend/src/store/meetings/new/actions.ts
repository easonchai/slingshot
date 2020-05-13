import { AppActions } from '../../constants';
import { IActionUnion, makeAction } from '../../types';
import { Meeting, GroupHashAndAddress } from '../types';

export const CreateFirstMeeting = makeAction<AppActions, Meeting>(AppActions.CREATE_FIRST_MEETING);
export const UpdateMeetingContractAddress = makeAction<AppActions, GroupHashAndAddress>(AppActions.UPDATE_MEETING_CONTRACT_ADDRESS);

export const actions = {
  CreateFirstMeeting,
  UpdateMeetingContractAddress
};

export type IAction = IActionUnion<typeof actions>;
