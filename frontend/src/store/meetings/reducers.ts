import { Action } from 'redux';
import { isType } from 'typescript-fsa';
import { actions, Meeting, ModelType } from './actions';
import { actions as userActions } from '../users/actions';

export interface IState {
  meetings: ReadonlyArray<Meeting>;
  cachedMeeting: Meeting;
}    

const initState: IState = {
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
      stake: 0.0,
      maxParticipants: 0,
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
    // TODO: verify whether we need to update spread the data field
    const updatedMeetings = state.meetings.map((meeting) => {
      if (meeting._id === action.payload.txHash) {
        return {
          ...meeting,
          _id: action.payload.meetingAddress,
          type: ModelType.MEETING
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
  
  if(isType(action, actions.UpdateRSVPList)) {
    // TODO: update the entry in overall meetings array too.
    // TODO: verify whether we need to update the nested data field
    return {
      ...state,
      cachedMeeting: {
        ...state.cachedMeeting,
        rsvp: [
          ...state.cachedMeeting.rsvp,
          action.payload.userAddress
        ]
      }
    };
  }

  if(isType(action, actions.UpdateRSVPListCancellation)) {
    // TODO: update the entry in overall meetings array too.
    // TODO: verify whether we need to update the nested data field
    return {
      ...state,
      cachedMeeting: {
        ...state.cachedMeeting,
        rsvp: state.cachedMeeting.rsvp.filter((address) => address !== action.payload.userAddress)
      }
    };
  }

  if (isType(action, userActions.UpdateUserEthereumAddress)) {
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

  if(isType(action, actions.UpdateStartMeeting)) {
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

  if(isType(action, actions.UpdateEndMeeting)) {
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

  if(isType(action, actions.UpdateCancelMeeting)) {
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

  if(isType(action, actions.UpdateHandleAttendance)) {
    return {
      ...state,
      cachedMeeting: {
        ...state.cachedMeeting,
        rsvp: state.cachedMeeting.rsvp.filter(user => user !== action.payload.userAddress),
        attend: [...state.cachedMeeting.attend, action.payload.userAddress]
      }
    };
  }

  return state;
}
