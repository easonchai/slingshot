import { createStore, combineReducers } from 'redux';
import { reducer as eventsReducer } from './events/reducers'

const rootReducer = combineReducers({
  app: eventsReducer
});

export type IAppState = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer);