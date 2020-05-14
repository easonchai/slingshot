import actionCreatorFactory from 'typescript-fsa';
import { AppActions } from '../constants';

export interface Loading {
  cachedMeetingLoaded: boolean;
}

const actionCreator = actionCreatorFactory();

export const UpdateCachedMeetingLoading = actionCreator<boolean>(AppActions.UPDATE_CACHED_MEETING_LOADING);

export const actions = {
  UpdateCachedMeetingLoading,
};
