import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { App } from './containers/App';
import { store } from './store/index';
import './index.css';
/*
TODO: check routing best practices
import { ConnectedRouter } from 'react-router-redux';
import { Router } from 'react-router-dom';
import { history } from './store';
*/

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);