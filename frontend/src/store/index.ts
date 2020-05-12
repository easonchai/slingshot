import { createStore, combineReducers } from 'redux';
import { reducer as eventsReducer } from './events/reducers'
import { reducer as userReducer } from './users/reducers'

const rootReducer = combineReducers({
  eventsReducer,
  userReducer
});

export type IAppState = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer);
