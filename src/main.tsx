import React from 'react';
import ReactDOM from 'react-dom';
import './polyfills';
import './index.css';
import './plugins/i18n';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
