import { createStore, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { reducer as meetingsReducer } from './meetings/reducers'
import { reducer as userReducer } from './users/reducers'
import { reducer as loadingReducer } from './loading/reducers'

const rootReducer = combineReducers({
  meetingsReducer,
  userReducer,
  loadingReducer
});

export type IAppState = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer, composeWithDevTools());