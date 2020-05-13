import { createStore, combineReducers } from 'redux';
import { reducer as allMeetingsReducer } from './meetings/all/reducers'
import { reducer as newMeetingReducer } from './meetings/new/reducers'
import { reducer as userReducer } from './users/reducers'

const rootReducer = combineReducers({
  allMeetingsReducer,
  newMeetingReducer,
  userReducer
});

export type IAppState = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer);
