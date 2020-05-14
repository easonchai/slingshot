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
  <Provider store={ store }>
    <BrowserRouter>
      <Switch>
        <Route path='/meetings/create' component={ MeetingAdd } />
        <Route
          path='/meetings/hash/:hash'
          render={ (props) => <MeetingView { ...props } isContractAddress={ false } /> }
        />
        <Route
          path='/meetings/contract/:address'
          render={ (props) => <MeetingView { ...props } isContractAddress={ true } /> }
        />
        <Route path='/' component={ App } />
      </Switch>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
