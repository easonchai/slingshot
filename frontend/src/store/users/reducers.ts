import { AppActions } from '../constants';
import { IAction, User } from './actions';

const initState: IState = {
  user: {
    ethereumAddress: ''
  }
};

export interface IState {
  user: User;
}

export const reducer = (state: IState = initState, action: IAction): IState => {
  switch (action.type) {
    case AppActions.UPDATE_USER_ETHEREUM_ADDRESS:
      const updatedUser = {
        ...state.user,
        ethereumAddress: action.payload.ethereumAddress
      };

      return { user: updatedUser };

    default:
      return state;
  }
}