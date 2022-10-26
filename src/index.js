import React from 'react';
import ReactDOM from 'react-dom/client';

import reportWebVitals from './reportWebVitals';
import App from './components/App';
import HTTP from './components/HTTP';

import './index.css';

// load highcharts
import Highcharts from 'highcharts/highstock';

// import highcharts modules
require('highcharts/modules/boost')(Highcharts)
require('highcharts/indicators/indicators')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/offline-exporting')(Highcharts)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  //<React.StrictMode>
    <HTTP />
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
