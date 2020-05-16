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

  return state;
}
