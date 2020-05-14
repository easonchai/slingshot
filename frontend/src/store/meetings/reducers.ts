import { Action } from 'redux';
import { isType } from 'typescript-fsa';
import { actions, Meeting } from './actions';
import { actions as userActions } from '../users/actions';

export interface IState {
  meetings: ReadonlyArray<Meeting>;
  cachedMeeting: Meeting;
}    

const initState: IState = {
  meetings: [],
  cachedMeeting: {
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
      cachedMeeting: action.payload
    };
  }

  if (isType(action, actions.ReadAllMeetings)) {
    return {
      ...state,
      meetings: action.payload
    };
  }

  if (isType(action, actions.ReadCachedMeeting)) {
    return {
      ...state,
      cachedMeeting: action.payload
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
      cachedMeeting: {
        ...state.cachedMeeting,
        meetingAddress: action.payload.meetingAddress
      }
    };
  }
  
  if(isType(action, actions.UpdateMeetingRSVPList)) {
    // TODO: update the entry in overall meetings array too.
    return {
      ...state,
      cachedMeeting: {
        ...state.cachedMeeting,
        users: [
          ...state.cachedMeeting.users,
          action.payload
        ]
      }
    };
  }

  if (isType(action, userActions.UpdateUserEthereumAddress)) {
    return {
      ...state,
      cachedMeeting: {
        ...state.cachedMeeting,
        organizerAddress: action.payload.ethereumAddress
      }
    }
  }

  return state;
}
