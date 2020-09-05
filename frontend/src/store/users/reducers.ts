import { Action } from 'redux';
import { isType } from 'typescript-fsa';
import { actions as userActions, ModelType, User } from './actions';
import { actions as meetingActions } from '../meetings/actions';

export const initState: IState = {
  user: {
    _id: '',
    type: ModelType.USER,
    admins: [],

    data: {
      ensDomain: '',
      feedback: [],
      
      cancel: [],
      rsvp: [],
      attend: [],
      withdraw: []
    }
  }
};

export interface IState {
  user: User;
}

export const reducer = (state: IState = initState, action: Action): IState => {
  if (isType(action, meetingActions.UpdateOrganiserEthereumAddress) ||
    isType(action, userActions.UpdateUserEthereumAddress)) {
    return {
      ...state,
      user: action.payload
    };
  }

  if (isType(action, meetingActions.UpdateRSVPList)) {
    return {
      ...state,
      user: {
        ...state.user,
        data: {
          ...state.user.data,
          cancel: state.user.data.cancel.filter(meeting => meeting !== action.payload.meetingAddress),
          rsvp: [...state.user.data.rsvp, action.payload.meetingAddress]
        }
      },
    };
  }

  if (isType(action, meetingActions.UpdateRSVPListCancellation)) {
    return {
      ...state,
      user: {
        ...state.user,
        data: {
          ...state.user.data,
          rsvp: state.user.data.rsvp.filter((address) => address !== action.payload.meetingAddress),
          cancel: [...state.user.data.cancel, action.payload.meetingAddress]
        }
      }
    };
  }

  if (isType(action, meetingActions.UpdateHandleAttendance)) {
    return {
      ...state,
      user: {
        ...state.user,
        data: {
          ...state.user.data,
          rsvp: state.user.data.rsvp.filter(meeting => meeting !== action.payload.meetingAddress),
          attend: [...state.user.data.attend, action.payload.meetingAddress]
        }
      }
    };
  }

  if (isType(action, meetingActions.UpdateHandleAbsence)) {
    return {
      ...state,
      user: {
        ...state.user,
        data: {
          ...state.user.data,
          rsvp: [...state.user.data.rsvp, action.payload.meetingAddress],
          attend: state.user.data.attend.filter(meeting => meeting !== action.payload.meetingAddress)
        }
      }
    };
  }

  if (isType(action, userActions.UpdateUserENSDomain)) {
    return {
      ...state,
      user: {
        ...state.user,
        data: {
          ...state.user.data,
          ensDomain: action.payload,
        }
      }
    };
  }

  if (isType(action, userActions.CreateUserFeedback)) {
    let updatedFeedbacks = state.user.data.feedback.slice();
    updatedFeedbacks.push(action.payload);

    return {
      ...state,
      user: {
        ...state.user,
        data: {
          ...state.user.data,
          feedback: updatedFeedbacks
        }
      }
    };
  }

  if (isType(action, meetingActions.UpdateUserWithdraw)) {
    return {
      ...state,
      user: {
        ...state.user,
        data: {
          ...state.user.data,
          rsvp: state.user.data.rsvp.filter(meeting => meeting !== action.payload.meetingAddress),
          attend: state.user.data.attend.filter(meeting => meeting !== action.payload.meetingAddress),
          withdraw: [...state.user.data.withdraw, action.payload.meetingAddress]
        }
      }
    };
  }

  return state;
}
