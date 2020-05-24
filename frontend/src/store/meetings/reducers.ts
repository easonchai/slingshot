import { Action } from 'redux';
import { isType } from 'typescript-fsa';
import { actions, Meeting, ModelType } from './actions';
import { actions as userActions } from '../users/actions';

export interface IState {
  meetings: ReadonlyArray<Meeting>;
  cachedMeeting: Meeting;
}

export const initState: IState = {
  meetings: [],
  cachedMeeting: {
    _id: '',
    type: ModelType.PENDING,

    data: {
      // BACKEND
      //txHash: string;  // only used as primary key for pending TX's
      //meetingAddress: string;  // id is replaced by contract address as primary key once TX is mined
      name: '',
      location: '',
      description: '',

      // SOLIDITY
      startDateTime: 0,
      endDateTime: 0,
      stake: 0.001,
      maxParticipants: 50,
      //registered: number,  // redundant -> rsvp.length + attend.length + withdraw.length
      prevStake: 0,
      payout: 0,
      //attendanceCount: number,  // redundant -> attend.length + withdraw.length
      isCancelled: false,
      isStarted: false,
      isEnded: false,
      deployerContractAddress: '0x8dF42792C58e7F966cDE976a780B376129632468',
      organizerAddress: '',

      parent: '',  // prev meeting
      child: '',  // next meeting

      images: [],
      videos: [],

      feedback: [],
    },

    // list of user wallets (ethereum address) linked to this meeting per status
    cancel: [],
    rsvp: [],
    attend: [],
    withdraw: []
  }
};

export const reducer = (state: IState = initState, action: Action): IState => {
  if (isType(action, actions.CreateFirstMeeting)) {
    return {
      ...state,
      meetings: [...state.meetings, action.payload],
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
    // TODO: verify whether we need to update spread the data field
    const updatedMeetings = state.meetings.map((meeting) => {
      if (meeting._id === action.payload.txHash) {
        return {
          ...meeting,
          _id: action.payload.meetingAddress,
          type: ModelType.MEETING
        };
      } else if (meeting.data.child === action.payload.txHash) {
        return {
          ...meeting,
          data: {
            ...meeting.data,
            child: action.payload.meetingAddress
          }
        };
      }

      return meeting;
    });

    return {
      ...state,
      meetings: updatedMeetings,
      cachedMeeting: {
        ...state.cachedMeeting,
        _id: action.payload.meetingAddress,
        type: ModelType.MEETING
      }
    };
  }

  if (isType(action, actions.UpdateRSVPList)) {
    const updatedMeetings = state.meetings.map(meeting => {
      if (meeting._id === action.payload.meetingAddress) {
        return {
          ...meeting,
          cancel: meeting.cancel.filter(user => user !== action.payload.userAddress),
          rsvp: [...meeting.rsvp, action.payload.userAddress]
        }
      }

      return meeting;
    });

    return {
      ...state,
      meetings: updatedMeetings,
      cachedMeeting: {
        ...state.cachedMeeting,
        cancel: state.cachedMeeting.cancel.filter(user => user !== action.payload.userAddress),
        rsvp: [...state.cachedMeeting.rsvp, action.payload.userAddress]
      },
    };
  }

  if (isType(action, actions.UpdateRSVPListCancellation)) {
    const updatedMeetings = state.meetings.map(meeting => {
      if (meeting._id === action.payload.meetingAddress) {
        return {
          ...meeting,
          rsvp: meeting.rsvp.filter(user => user !== action.payload.userAddress),
          cancel: [...meeting.cancel, action.payload.userAddress]
        }
      }

      return meeting;
    });

    return {
      ...state,
      meetings: updatedMeetings,
      cachedMeeting: {
        ...state.cachedMeeting,
        rsvp: state.cachedMeeting.rsvp.filter(userAddress => userAddress !== action.payload.userAddress),
        cancel: [...state.cachedMeeting.cancel, action.payload.userAddress]
      }
    };
  }

  if (isType(action, actions.UpdateOrganiserEthereumAddress)) {
    return {
      ...state,
      cachedMeeting: {
        ...state.cachedMeeting,
        data: {
          ...state.cachedMeeting.data,
          organizerAddress: action.payload._id
        }
      }
    }
  }

  if (isType(action, actions.UpdateStartMeeting)) {
    if (state.cachedMeeting._id === action.payload) {
      return {
        ...state,
        cachedMeeting: {
          ...state.cachedMeeting,
          data: {
            ...state.cachedMeeting.data,
            isStarted: true
          }
        }
      };
    }

    return state;
  }

  if (isType(action, actions.UpdateEndMeeting)) {
    if (state.cachedMeeting._id === action.payload) {
      return {
        ...state,
        cachedMeeting: {
          ...state.cachedMeeting,
          data: {
            ...state.cachedMeeting.data,
            isEnded: true
          }
        }
      };
    }

    return state;

  }

  if (isType(action, actions.UpdateCancelMeeting)) {
    if (state.cachedMeeting._id === action.payload) {
      return {
        ...state,
        cachedMeeting: {
          ...state.cachedMeeting,
          data: {
            ...state.cachedMeeting.data,
            isCancelled: true
          }
        }
      };
    }

    return state;
  }

  if (isType(action, actions.UpdateHandleAttendance)) {
    const updatedMeetings = state.meetings.map(meeting => {
      if (meeting._id === action.payload.meetingAddress) {
        return {
          ...meeting,
          rsvp: meeting.rsvp.filter(userAddress => userAddress !== action.payload.userAddress),
          attend: [...meeting.attend, action.payload.userAddress]
        };
      }

      return meeting;
    });

    return {
      ...state,
      meetings: updatedMeetings,
      cachedMeeting: {
        ...state.cachedMeeting,
        rsvp: state.cachedMeeting.rsvp.filter(user => user !== action.payload.userAddress),
        attend: [...state.cachedMeeting.attend, action.payload.userAddress]
      }
    };
  }

  if (isType(action, actions.CreateNextMeeting)) {
    const updatedMeetings = state.meetings.map(meeting => {
      if (meeting._id === action.payload.data.parent) {
        return {
          ...meeting,
          data: {
            ...meeting.data,
            child: action.payload._id
          }
        };
      }

      return meeting;
    });

    return {
      ...state,
      meetings: updatedMeetings,
      cachedMeeting: action.payload
    };
  }

  if (isType(action, userActions.CreateUserFeedback)) {
    return {
      ...state,
      cachedMeeting: {
        ...state.cachedMeeting,
        data: {
          ...state.cachedMeeting.data,
          feedback: [...state.cachedMeeting.data.feedback, action.payload]
        }
      }
    };
  }

  return state;
}
