import React from 'react';
import ReactDOM from 'react-dom/client';
import Highcharts from 'highcharts/highstock';
import App from './components/App';

// import highcharts modules
require('highcharts/modules/boost')(Highcharts)
require('highcharts/indicators/indicators')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/offline-exporting')(Highcharts)
require('highcharts-export-data')(Highcharts)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	//<React.StrictMode>
		<App />
	//</React.StrictMode>
);

/* forces console clear on hot reload during development */
/*
window.addEventListener('message', e => {
	if (process.env.NODE_ENV !== 'production' && e.data && e.data.type === 'webpackInvalid') {
		console.clear();
	}
});
*/

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
