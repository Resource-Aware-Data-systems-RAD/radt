import React from 'react';
import { url, headers } from '../utils';
import Experiments from './Experiments';
import Workloads from './Workloads';
import Runs from './Runs';

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
			selectedRuns: [],

			activeExperimentId: null,
			activeWorkload: null,
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
						"duration": element["duration"],
						"startTime": element["start_time"],
						"source": element["data"],	
						"letter": element["letter"],
						"model": element["model"],
						"params": element["params"],
						"status": element["status"],
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
	setVisibleWorkloads(experimentId) {
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
			visibleWorkloads: filteredWorkloads,
			visibleRuns: [],
			activeExperimentId: experimentId
		});

		///////////////////// just tested making EXPERIMENTS stateless and 
		///////////////////// pulling up activeExperimentId from it
		///////////////////// so need to do same with WORKLOADS now
		///////////////////// then see if this all makes more sense?? 

	}

	setVisibleRuns(workload) {
		workload = workload === "null" ? null : workload;
		const { runData, activeExperimentId } = this.state;
		let filteredRuns = [];
		for (let i = 0; i < runData.length; i++) {		
			const run = runData[i];
			if (workload === null) {
				if (run.experimentId === activeExperimentId) {
					filteredRuns.push(run);
				}
			}
			else if (run.workload === workload) {
				filteredRuns.push(run);
			}
		}
		this.setState({
			visibleRuns: filteredRuns
		});
		console.log(filteredRuns);
	}

	componentDidMount() {
		this.fetchExperiments();
		this.fetchRuns();
	}

	render() {
		const { experimentData, visibleWorkloads, visibleRuns, activeExperimentId } = this.state;
		return (
			<div id="dataPickerWrapper">
				<ExperimentsTest2
					value={experimentData}
					activeExperimentId={activeExperimentId}
					onClick={this.setVisibleWorkloads.bind(this)}
				/>
				<Workloads
					value={visibleWorkloads}
					onClick={this.setVisibleRuns.bind(this)}
				/>
				<Runs 
					value={visibleRuns}
				/>
			</div>
		);
	}
}
export default DataPicker;

function ExperimentsTest1(props) {
    return (
		<div id="experimentWrapper">
			{props.value.map(experiment => (
				<button
					key={experiment.id}
					className={props.activeExperimentId === experiment.id ? "active" : null}
					onClick= {() => props.onClick(experiment.id)}
				>
					<span className="text">{experiment.name}</span>
				</button>
			))}
		</div>
	)
}

const ExperimentsTest2 = props => (
	<div id="experimentWrapper">
		{props.value.map(experiment => (
			<button
				key={experiment.id}
				className={props.activeExperimentId === experiment.id ? "active" : null}
				onClick= {() => props.onClick(experiment.id)}
			>
				<span className="text">{experiment.name}</span>
			</button>
		))}
	</div>
)


