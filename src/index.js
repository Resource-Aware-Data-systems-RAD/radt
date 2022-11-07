import React from 'react';
import ReactDOM from 'react-dom/client';
import Highcharts from 'highcharts/highstock';

import App from './components/App';

//import reportWebVitals from './reportWebVitals';
//import LocalDataTest from './components/LocalDataTest';
//import { BasicExample, VariantsExample } from './components/Dropdown';

import './index.css';

// import highcharts modules
require('highcharts/modules/boost')(Highcharts)
require('highcharts/indicators/indicators')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/offline-exporting')(Highcharts)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  //<React.StrictMode>
    <React.Fragment>
      <App />
    </React.Fragment>
  //</React.StrictMode>
);

window.addEventListener('message', e => {
  if (process.env.NODE_ENV !== 'production' && e.data && e.data.type === 'webpackInvalid') {
    console.clear();
  }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
