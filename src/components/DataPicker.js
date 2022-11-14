import React from 'react';
import { url, headers } from '../utils';
import Experiments from './Experiments';
import Workloads from './Workloads';

import '../styles/DataPicker.css';

let endpoints = {
	"experiments": "fe_experiments",
	"runs": "fe_runs"
}

class DataPicker extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			isFetching: false,
			experimentData: [],
			runData: [],
			visibleWorkloads: [],
			visibleRuns: [],
			selectedRuns: []
		};
	}

	/* fetch all experiemnts or a specific experiment */
	fetchExperiments(param = "") {
		if (param == "") {
			this.fetchData(endpoints["experiments"]);
		}
		else {
			this.fetchData(endpoints["experiments"], "?experiment_id=eq." + param);
		}
	};

	/* fetch all runs or a specific run */
	fetchRuns(param = "") {
		if (param == "") {
			this.fetchData(endpoints["runs"]);
		}
		else {
			this.fetchData(endpoints["runs"], "?experiment_id=eq." + param);
		}
	};

	/* fetch data from relevant API endpoint */
	fetchData(endpoint, param = "") {
		console.log("Fetching... " + url + endpoint + param);
		this.setState({ isFetching: true });
		return fetch(url + endpoint + param, { headers })
			.then(response => response.json())
			.then((json) => {
				//console.log(json); // debugging
				this.setState({ isFetching: false });
				this.parseDataAndSetState(endpoint, json);
			})
			.catch((error) => {
				alert(error);
			})
	};

	/* parse data returned from endpoints into custom objects (if needed) and then apply to component state */
	parseDataAndSetState(endpoint, json) {
		let filteredData = [];
		switch (endpoint) {		
			/* experiments endpoint */
			case endpoints["experiments"]:
				json.forEach(element => {
					filteredData.push({
						"id": element["experiment_id"],
						"name": element["name"]
					})
				});
				this.setState({
					experimentData: filteredData
				});
				break;

			/* experiments endpoint */
			case endpoints["runs"]:
				json.forEach(element => {
					filteredData.push({
						"workload": element["workload"],
						"experimentId": element["experiment_id"],
						"name": element["run_uuid"],
						/*
						"duration": element["duration"],
						"startTime": element["start_time"],
						"source": element["data"],	
						"letter": element["letter"],
						"model": element["model"],
						"params": element["params"],			
						*/
					})
				});
				this.setState({
					runData: filteredData
				});
				break;

			/* experiments endpoint */
			default:
				alert("Endpoint not recognised: " + endpoint);

		}
	};

	/* select experiment and render its workloads to the workloads component */
	selectExperiment(experimentId) {
		const { runData } = this.state;
		let filteredWorkloads = [];
		for (let i = 0; i < runData.length; i++) {
			const run = runData[i];
			if (run.experimentId === experimentId) {
				if (run.workload == null) {
					if (filteredWorkloads.indexOf("null") == -1) {
						filteredWorkloads.push("null");
					}			
				}
				else if (filteredWorkloads.indexOf(run.workload) == -1) {
					filteredWorkloads.push(run.workload);
				}
			}
		}
		this.setState({
			visibleWorkloads: filteredWorkloads
		});
	}

	componentDidMount() {
		this.fetchExperiments();
		this.fetchRuns();
	}

	render() {
		const { experimentData, visibleWorkloads } = this.state;
		return (
			<div id="dataPickerWrapper">
				<Experiments
					value={experimentData}
					onClick={this.selectExperiment.bind(this)}
				/>
				<Workloads
					value={visibleWorkloads}
				/>
			</div>
		);
	}
}

export default DataPicker;
