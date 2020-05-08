import { AppActions } from '../constants';
import { IAction, Event } from './actions';

const passiveEvents = [
  {
    name:"ended #1",
    isEnded:true,
    address:"0x0000000",
  },
  {
    name:"ended #2",
    isEnded:true,
    address:"0x0000001",
  },
  {
    name:"active #1",
    isEnded:false,
    address:"0x0000001",
  }
];

const initState: IState = {
  events: [...passiveEvents]
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