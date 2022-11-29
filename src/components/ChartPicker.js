import React from 'react';
import { url, endpoints, headers, HTTP } from '../utils';
import '../styles/ChartPicker.css';

class ChartPicker extends React.Component {

	constructor(props) {
		super(props);
		this.state = {

		};
	}

	sleepFor(ms) {
		return function(x) {
		  return new Promise(resolve => setTimeout(() => resolve(x), ms));
		};
	}

	async fetchAvailableMetrics(runs) {

		//this.fetchData(endpoints.metrics, "?run_uuid=eq." + runs[0].name);

		/*
		runs.forEach(run => {
			this.fetchData(endpoints.metrics, "?run_uuid=eq." + run.name);
		});
		*/

		let counter = 0;
		let total = runs.length;

		let results = [];

		runs.forEach(run => {

			let param = "?run_uuid=eq." + run.name;
			let randomTime = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);

			console.log("Fetching... " + run.name.substring(0, 5) + " in " + randomTime + "ms");

			return fetch(url + endpoints.metrics + param, { headers })


			.then(this.sleepFor(randomTime))
			

			.then(response => response.json())
			.then((json) => {
				results.push(json);
				counter++;
				console.log(run.name.substring(0, 5) + " done!");
				if (counter === total) {
					console.log(results);
				}
			})
			.catch((error) => {
				alert(error);
			})
		});

	};

	fetchData(endpoint, param = "") {
		console.log("Fetching... " + url + endpoint + param);
		return fetch(url + endpoint + param, { headers })
		.then(response => response.json())
		.then((json) => {
			console.log(json); // debugging
			//this.setState({ isFetching: false });
			//this.parseDataAndSetState(endpoint, json);
		})
		.catch((error) => {
			alert(error);
		})
	};

	updateSelectedRuns = (newSelectedRuns) => {
		this.setState({selectedRuns: newSelectedRuns});
	}


	render() {
		const selectedRUus = this.props.pushSelectedRuns;
		return (
			<div
				id="chartPickerWrapper"
				className={this.props.toHide ? null : "hide"}
			>
				<button onClick={() => this.fetchAvailableMetrics(selectedRUus)}>+</button>
			</div>
		);
	}
}
export default ChartPicker;
