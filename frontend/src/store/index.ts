import { createStore, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { reducer as meetingsReducer } from './meetings/reducers'
import { reducer as userReducer } from './users/reducers'

const rootReducer = combineReducers({
  meetingsReducer,
  userReducer
});

export type IAppState = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer, composeWithDevTools());
