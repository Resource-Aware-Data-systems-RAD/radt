import React from 'react';
import Selections from './Selections';
import { url, headers } from '../utils';
import '../styles/DataPicker.css';

// endpoints for API
const endpoints = {
	"experiments": "fe_experiments",
	"runs": "fe_runs"
}

class DataPicker extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			isFetching: false,
			isVisible: true,
			experimentData: [],
			runData: [],
			activeExperimentId: null,
			activeWorkload: null,
			visibleWorkloads: [],
			visibleRuns: [],
			selectedWorkloads: [],
			selectedRuns: [],
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

					if (element["workload"] === null) {
						element["workload"] = 0;
					}

					let workloadId = element["experiment_id"] + "-" + element["workload"]

					filteredData.push({
						"experimentId": element["experiment_id"],
						"name": element["run_uuid"],
						"duration": element["duration"],
						"startTime": element["start_time"],
						"source": element["data"],	
						"letter": element["letter"],
						"model": element["model"],
						"params": element["params"],
						"status": element["status"],
						"workload": workloadId,
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
				if (filteredWorkloads.indexOf(run.workload) == -1) {
					filteredWorkloads.push(run.workload);
				}
			}
		}

		this.setState({
			visibleWorkloads: filteredWorkloads,
			visibleRuns: [],
			activeExperimentId: experimentId
		});
	}

	/* select workload and render its runs to the runs component */
	setVisibleRuns(workload) {
		const { runData, activeExperimentId } = this.state;
		let filteredRuns = [];
		for (let i = 0; i < runData.length; i++) {		
			const run = runData[i];
			if (run.workload === workload) {
				filteredRuns.push(run);
			}
		}
		this.setState({
			visibleRuns: filteredRuns,
			activeWorkload: workload
		});
	}

	/* adds or removes runs and workloads to a selection array */
	toggleRunWorkloadSelection(workload, run = null) {

		// grab current state and clone it for changes
		const { selectedWorkloads, selectedRuns, runData } = this.state;
		let newSelectedWorkloads = [...selectedWorkloads];
		let newSelectedRuns = [...selectedRuns];

		// four different ways the yser can add data to selection
		if (run === null) {
			// add all runs from this workload to selection if they are not already added
			let workloadIndex = newSelectedWorkloads.indexOf(workload);
			if (workloadIndex === -1) {
				runData.forEach(run => {
					if (run.workload === workload) {
						let runIndex = newSelectedRuns.findIndex(el => el.name === run.name);
						if (runIndex === -1) {
							newSelectedRuns.push(run);
						}
					}
				});
			}
			else {
				// remove all runs from this workload from selection
				newSelectedRuns = newSelectedRuns.filter(el => el.workload !== workload);
			}
		}
		else {
			let runIndex = newSelectedRuns.findIndex(el => el.name === run.name);
			if (runIndex === -1) {
				// add run to selection if it is not already added
				newSelectedRuns.push(run);
			}
			else {
				// remove run from selection if it is already added
				newSelectedRuns = newSelectedRuns.slice(0, runIndex).concat(newSelectedRuns.slice(runIndex + 1));
			}
		}

		// update list of selected workloads based on new selected runs
		newSelectedWorkloads = [];
		newSelectedRuns.forEach(run => {	
			let workloadIndex = newSelectedWorkloads.indexOf(run.workload);
			if (workloadIndex === -1) {
				newSelectedWorkloads.push(run.workload);
			}
		});

		this.setState({
			selectedWorkloads: newSelectedWorkloads,
			selectedRuns: newSelectedRuns
		});

		// push copy of selected runs to parent
		this.props.handleSelectedRuns(newSelectedRuns);
	}

	submitSelections() {
		const {isVisible} = this.state;
		let newVisibility = !isVisible;
		this.setState({
			isVisible: newVisibility
		});

		console.log("Fired!");
	}

	/* fetch experiment and run data from server on component mount */
	componentDidMount() {
		this.fetchExperiments();
		this.fetchRuns();
	}

	render() {

		const { 
			experimentData, 
			visibleWorkloads, 
			visibleRuns, 
			activeExperimentId,
			activeWorkload,
			selectedWorkloads,
			selectedRuns,
			isVisible,
		} = this.state;

		return (
			<div 
				id="dataPickerWrapper"
				className={isVisible ? null : "hide"}
			>
				<Experiments
					data={experimentData}
					activeExperimentId={activeExperimentId}
					onClickSetVisibleWorkloads={this.setVisibleWorkloads.bind(this)}
				/>
				<Workloads
					data={visibleWorkloads}
					activeWorkload={activeWorkload}
					selectedWorkloads={selectedWorkloads}
					onClickSetVisibleRuns={this.setVisibleRuns.bind(this)}
					onClickToggleWorkloadSelection={this.toggleRunWorkloadSelection.bind(this)}
				/>
				<Runs 
					data={visibleRuns}
					selectedRuns={selectedRuns}
					onClickToggleRunSelection={this.toggleRunWorkloadSelection.bind(this)}	
				/>
				<Selections 
					selectedRuns={selectedRuns}
					onClickToggleWorkloadSelection={this.toggleRunWorkloadSelection.bind(this)}
				/>
				<button 
					className="selectionConfirmBtn"
					onClick={() => this.submitSelections()}
					>
						Confirm
				</button>
			</div>
		);

	}
}

/* DataPicker functional components */
function Experiments(props) {
    return (
		<div id="experimentWrapper">
			{props.data.sort((a, b) => a.id - b.id).map(experiment => (
				<button
					key={experiment.id}
					className={props.activeExperimentId === experiment.id ? "active" : null}
					onClick= {() => props.onClickSetVisibleWorkloads(experiment.id)}
				>
					<span className="text">{experiment.id}: {experiment.name}</span>
				</button>
			))}
		</div>
	)
}
function Workloads(props) {

	function sortWorkloads(a, b) {	
		let x = a.substring(a.indexOf("-") + 1);
		let y = b.substring(b.indexOf("-") + 1);
		return x - y;
	}

	return (
		<div id="workloadsWrapper"> 
			{props.data.slice().sort((a, b) => sortWorkloads(a, b)).map(workload => (
				<div 
					key={workload}
					className={`workload ${props.activeWorkload === workload ? "active" : null}`}
					onClick={() => props.onClickSetVisibleRuns(workload)}
				>
					<div className="info">
						Workload {workload}
					</div>
					<div className="checkboxWrapper">
						<div className="checkbox"
							onClick={() => props.onClickToggleWorkloadSelection(workload)}
						>
							{props.selectedWorkloads.includes(workload) ? "X" : " "}
						</div>
					</div>		
				</div>
			))}
		</div>
	)
}
function Runs(props) {
	return (
		<div id="runsWrapper">
			{props.data.slice().sort((a, b) => a.startTime - b.startTime).map(run => (
				<button
					key={run.name}
					onClick={() => props.onClickToggleRunSelection(run.workload, run)}
				>
					<span className="text">Run {run.name.substring(0, 6)}</span>
					<div className="checkbox">{props.selectedRuns.findIndex(el => el.name === run.name) > -1 ? "X" : " "}</div>
				</button>
			))}
		</div>
	)
}

export default DataPicker;
