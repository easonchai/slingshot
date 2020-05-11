import { AppActions } from '../constants';
import { IAction, Event } from './actions';

const passiveEvents = [
  {
    name:"Event Title #1",
    stake: 0.05,
    maxParticipants: 10,
    startDate: null,
    startTime: null,
    location: "Online",
    description: "This event will be used for ...",
    isEnded:true,
    ownerAddress:"0x0...0",
    contractAddress:"0x0...0",
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