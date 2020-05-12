import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { App } from './containers/App';
import { AddEvent } from './containers/AddEvent';
import { ViewEvent } from './containers/ViewEvent';
import { store } from './store/index';
import './index.css';

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route path='/events/create' component={AddEvent} />
        <Route
          path='/events/hash/:hash'
          render={ (props) => <ViewEvent {...props} isContractAddress={ false } /> }
        />
        <Route
          path='/events/contract/:address'
          render={ (props) => <ViewEvent {...props} isContractAddress={ true } /> }
        />
        <Route path='/' component={App} />
      </Switch>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
