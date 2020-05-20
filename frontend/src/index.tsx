import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { App } from './containers/App';
import { MeetingAdd } from './containers/meetings/MeetingAdd';
import { MeetingView } from './containers/meetings/MeetingView';
import { store } from './store/index';
import './index.css';

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route
          path='/meeting/create/:parent'
          render={(props) => <MeetingAdd {...props} />}
        />
        <Route
          path='/meeting/:id'
          render={(props) => <MeetingView {...props} />}
        />
        <Route path='/' component={App} />
      </Switch>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
