import { Action } from 'redux';
import { isType } from 'typescript-fsa';
import { actions, Loading } from './actions';

const initState: IState = {
  loading: {
    cachedMeeting: false,
    meetingDeployment: false,
    rsvpConfirmation: false
  }
};

export interface IState {
  loading: Loading;
}

export const reducer = (state: IState = initState, action: Action): IState => {
  if (isType(action, actions.UpdateCachedMeetingLoading)) {
    return {
      ...state,
      loading: {
        ...state.loading,
        cachedMeeting: action.payload
      }
    };
  }

  if (isType(action, actions.UpdateMeetingDeploymentLoading)) {
    return {
      ...state,
      loading: {
        ...state.loading,
        meetingDeployment: action.payload
      }
    };
  }

  if (isType(action, actions.UpdateRsvpConfirmationLoading)) {
    return {
      ...state,
      loading: {
        ...state.loading,
        rsvpConfirmation: action.payload
      }
    };
  }

  return state;
}
