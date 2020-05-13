import { AppActions } from '../../constants';
import { IAction } from './actions';
import { Meeting } from '../types';

export interface IState {
  meetings: Array<Meeting>;
}

const initState: IState = {
  meetings: []
};

export const reducer = (state: IState = initState, action: IAction): IState => {
  switch (action.type) {
    case AppActions.READ_ALL_MEETINGS:
      return {
        meetings: action.payload
      }

    default:
      return state;
  }
}
