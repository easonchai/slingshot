import { Action } from 'redux';
import { isType } from 'typescript-fsa';
import { actions, Loading } from './actions';

const initState: IState = {
  loading: {
    cachedMeetingLoaded: false
  }
};

export interface IState {
  loading: Loading;
}

export const reducer = (state: IState = initState, action: Action): IState => {
  if (isType(action, actions.UpdateCachedMeetingLoading)) {
    return {
      loading: {
        ...state.loading,
        cachedMeetingLoaded: action.payload
      }
    };
  }

  return state;
}
