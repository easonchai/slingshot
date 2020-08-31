import { Action } from 'redux';
import { isType } from 'typescript-fsa';
import { actions, Loading } from './actions';

const initState: IState = {
  loading: {
    cachedMeeting: false,
    clubDeployment: false,
    meetingDeployment: false,
    rsvpConfirmation: false,
    rsvpCancellationConfirmation: false,
    startMeetingConfirmation: false,
    endMeetingConfirmation: false,
    cancelMeetingConfirmation: false,

    markAttendanceConfirmation: false,
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

  if (isType(action, actions.UpdateClubDeploymentLoading)) {
    return {
      ...state,
      loading: {
        ...state.loading,
        clubDeployment: action.payload
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

  if (isType(action, actions.UpdateRsvpCancellationConfirmationLoading)) {
    return {
      ...state,
      loading: {
        ...state.loading,
        rsvpCancellationConfirmation: action.payload
      }
    };
  }

  if (isType(action, actions.UpdateStartMeetingConfirmationLoading)) {
    return {
      ...state,
      loading: {
        ...state.loading,
        startMeetingConfirmation: action.payload
      }
    };
  }

  if (isType(action, actions.UpdateEndMeetingConfirmationLoading)) {
    return {
      ...state,
      loading: {
        ...state.loading,
        endMeetingConfirmation: action.payload
      }
    };
  }

  if (isType(action, actions.UpdateCancelMeetingConfirmationLoading)) {
    return {
      ...state,
      loading: {
        ...state.loading,
        cancelMeetingConfirmation: action.payload
      }
    };
  }

  if (isType(action, actions.UpdateMarkAttendanceConfirmationLoading)) {
    return {
      ...state,
      loading: {
        ...state.loading,
        markAttendanceConfirmation: action.payload
      }
    };
  }

  return state;
}
