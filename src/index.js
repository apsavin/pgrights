import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { router } from './data';
import { configure } from 'mobx';

configure({
  enforceActions: 'observed',
});

ReactDOM.render(<App router={router} />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept('./App', () => {
    // eslint-disable-next-line global-require
    const NextApp = require('./App').default;
    ReactDOM.render(<NextApp router={router} />, document.getElementById('root'));
  });
}
