import { AppActions } from '../constants';
import { IAction, Event } from './actions';

const e = {
  name: "t",
  isEnded: false,
  address: "genesis"
};
const initState: IState = {
  events: [e, e]
};

export interface IState {
  events: Array<Event>;
}

export const reducer = (state: IState = initState, action: IAction): IState => {
  switch (action.type) {
    case AppActions.SET_EVENT:
      return Object.assign({}, state, {
          events: [
            ...state.events,
            action.payload
          ]
        });
    default:
      return state;
  }
}