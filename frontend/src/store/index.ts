import { createStore, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { reducer as notificationReducer } from './notifications/reducers';
import { reducer as clubsReducer } from './clubs/reducers';
import { reducer as meetingsReducer } from './meetings/reducers';
import { reducer as userReducer } from './users/reducers';
import { reducer as loadingReducer } from './loading/reducers';


const rootReducer = combineReducers({
  notificationReducer,
  clubsReducer,
  meetingsReducer,
  userReducer,
  loadingReducer
});

export type IAppState = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer, composeWithDevTools());
