import { Action } from 'redux';
import { isType } from 'typescript-fsa';
import { actions as userActions, ModelType, User } from './actions';
import { actions as meetingActions } from '../meetings/actions';

export const initState: IState = {
  user: {
    _id: '',
    type: ModelType.USER,
    data: {
      ensDomain: '',
      feedback: [],
    },
    cancel: [],
    rsvp: [],
    attend: [],
    withdraw: []
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
        cancel: state.user.cancel.filter(meeting => meeting !== action.payload.meetingAddress),
        rsvp: [...state.user.rsvp, action.payload.meetingAddress]
      }
    };
  }

  if (isType(action, meetingActions.UpdateRSVPListCancellation)) {
    return {
      ...state,
      user: {
        ...state.user,
        rsvp: state.user.rsvp.filter((address) => address !== action.payload.meetingAddress),
        cancel: [...state.user.cancel, action.payload.meetingAddress]
      }
    };
  }

  if (isType(action, meetingActions.UpdateHandleAttendance)) {
    return {
      ...state,
      user: {
        ...state.user,
        rsvp: state.user.rsvp.filter(meeting => meeting !== action.payload.meetingAddress),
        attend: [...state.user.attend, action.payload.meetingAddress]
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
    return {
      ...state,
      user: {
        ...state.user,
        data: {
          ...state.user.data,
          feedback: [...state.user.data.feedback, action.payload]
        }
      }
    };
  }

  if (isType(action, meetingActions.UpdateUserWithdraw)) {
    return {
      ...state,
      user: {
        ...state.user,
        rsvp: state.user.rsvp.filter(meeting => meeting !== action.payload.meetingAddress),
        attend: state.user.attend.filter(meeting => meeting !== action.payload.meetingAddress),
        withdraw: [...state.user.withdraw, action.payload.meetingAddress]
      }
    };
  }

  return state;
}
