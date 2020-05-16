import actionCreatorFactory from 'typescript-fsa';
import { AppActions } from '../constants';

export interface Loading {
  cachedMeeting: boolean;
  meetingDeployment: boolean;
  rsvpConfirmation: boolean;
  rsvpCancellationConfirmation: boolean;
}

const actionCreator = actionCreatorFactory();

export const UpdateCachedMeetingLoading = actionCreator<boolean>(AppActions.UPDATE_CACHED_MEETING_LOADING);
export const UpdateMeetingDeploymentLoading = actionCreator<boolean>(AppActions.UPDATE_MEETING_DEPLOYMENT_LOADING);
export const UpdateRsvpConfirmationLoading = actionCreator<boolean>(AppActions.UPDATE_RSVP_CONFIRMATION_LOADING);
export const UpdateRsvpCancellationConfirmationLoading = actionCreator<boolean>(AppActions.UPDATE_RSVP_CANCELLATION_CONFIRMATION_LOADING);

export const actions = {
  UpdateCachedMeetingLoading,
  UpdateMeetingDeploymentLoading,
  UpdateRsvpConfirmationLoading,
  UpdateRsvpCancellationConfirmationLoading
};
