import { AppActions } from '../constants';
import { makeAction } from '../types';

export interface Event {
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

export const CreateFirstMeeting = makeAction<AppActions, Event>(AppActions.CREATE_FIRST_MEETING);
export const UpdateMeetingContractAddress = makeAction<AppActions, GroupHashAndAddress>(AppActions.UPDATE_MEETING_CONTRACT_ADDRESS);

export const actions = {
  CreateFirstMeeting,
  UpdateMeetingContractAddress
};
