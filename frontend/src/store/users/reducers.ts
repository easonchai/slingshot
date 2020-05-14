import { Action } from 'redux';
import { isType } from 'typescript-fsa';
import { actions, User } from './actions';

const initState: IState = {
  user: {
    ethereumAddress: ''
  }
};

export interface IState {
  user: User;
}

export const reducer = (state: IState = initState, action: Action): IState => {
  if (isType(action, actions.UpdateUserEthereumAddress)) {
    return {
      user: {
        ...state.user,
        ethereumAddress: action.payload.ethereumAddress
      }
    };
  }

  return state;
}
