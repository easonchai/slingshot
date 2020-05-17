import { Action } from 'redux';
import { isType } from 'typescript-fsa';
import { actions, Notification } from './actions';

export interface IState {
  notifications: ReadonlyArray<Notification>
}

const initState: IState = {
  notifications: []
};

export const reducer = (state: IState = initState, action: Action): IState => {
  if (isType(action, actions.AddNotification)) {
    return {
      ...state,
      notifications: [
        ...state.notifications,
        action.payload
      ]
    };
  }

  if (isType(action, actions.RemoveNotification)) {
    return {
      ...state,
      notifications: state.notifications.filter((item, index) => index !== action.payload)
    };
  }

  return state;
}
