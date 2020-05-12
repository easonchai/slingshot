import { AppActions } from '../constants';
import { IAction, Event } from './actions';

const initState: IState = {
  events: []
};

export interface IState {
  events: Array<Event>;
}

export const reducer = (state: IState = initState, action: IAction): IState => {
  switch (action.type) {
    case AppActions.CREATE_FIRST_MEETING:
      return Object.assign({}, state, {
          events: [
            ...state.events,
            action.payload
          ]
        });

    case AppActions.UPDATE_MEETING_CONTRACT_ADDRESS:
      const updatedEvents = state.events.map((event: Event) => {
        if (event.txHash === action.payload.txHash) {
          // Update contract meeting address
          return {
            ...event,
            meetingAddress: action.payload.meetingAddress
          }
        } else {
          return event;
        }
      });
      return { events: updatedEvents };

    default:
      return state;
  }
}