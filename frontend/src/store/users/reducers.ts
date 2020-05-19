import { Action } from 'redux';
import { isType } from 'typescript-fsa';
import { actions as userActions, ModelType, User } from './actions';
import { actions as meetingActions } from '../meetings/actions';

const initState: IState = {
  user: {
    _id: '',
    type: ModelType.USER,
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
  if (isType(action, userActions.UpdateUserEthereumAddress)) {
    // TODO: update the whole user object (retrieve array data from the backend.)
    return {
      ...state,
      user: {
        ...state.user,
        _id: action.payload._id
      }
    };
  }
    
  if(isType(action, meetingActions.UpdateRSVPList)) {
    return {
      ...state,
      user: {
        ...state.user,
        rsvp: [
          ...state.user.rsvp,
          action.payload.meetingAddress
        ]
      }
    };
  }

  if(isType(action, meetingActions.UpdateRSVPListCancellation)) {
    // TODO: update the entry in overall meetings array too.
    // TODO: verify whether we need to update the nested data field
    return {
      ...state,
      user: {
        ...state.user,
        rsvp: state.user.rsvp.filter((address) => address !== action.payload.meetingAddress)
      }
    };
  }

  if(isType(action, meetingActions.UpdateHandleAttendance)) {
    return {
      ...state,
      user: {
        ...state.user,
        rsvp: state.user.rsvp.filter(meeting => meeting !== action.payload.meetingAddress),
        attend: [...state.user.attend, action.payload.meetingAddress]
      }
    };
  }

  return state;
}
