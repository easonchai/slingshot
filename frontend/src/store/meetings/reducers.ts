import { Action } from 'redux';
import { isType } from 'typescript-fsa';
import { actions, Meeting } from './actions';

export interface IState {
  meetings: ReadonlyArray<Meeting>;
  newMeeting: Meeting;
}

const initState: IState = {
  meetings: [],
  newMeeting: {
    txHash: '',
    meetingAddress: '',
    name: '',
    location: '',
    description: '',
    users: [],
    startDateTime: 0,
    endDateTime: 0,
    stake: 0.0,
    maxParticipants: 0,
    registered: 0,
    prevStake: 0,
    payout: 0,
    attendanceCount: 0,
    isCancelled: false,
    isStarted: false,
    isEnded: false,
    deployerContractAddress: '0x8dF42792C58e7F966cDE976a780B376129632468',
    organizerAddress: ''
  }
};

export const reducer = (state: IState = initState, action: Action): IState => {
  if (isType(action, actions.CreateFirstMeeting)) {
    return {
      ...state,
      meetings: [action.payload, ...state.meetings],
      newMeeting: action.payload
    };
  }

  if (isType(action, actions.ReadAllMeetings)) {
    return {
      ...state,
      meetings: action.payload
    };
  }

  if (isType(action, actions.UpdateMeetingContractAddress)) {
    const updatedMeetings = state.meetings.map((meeting) => {
      if (meeting.txHash === action.payload.txHash) {
        return {
          ...meeting,
          meetingAddress: action.payload.meetingAddress
        };
      }

      return meeting;
    });

    return {
      ...state,
      meetings: updatedMeetings,
      newMeeting: {
        ...state.newMeeting,
        meetingAddress: action.payload.meetingAddress
      }
    };
  }

  return state;
}
