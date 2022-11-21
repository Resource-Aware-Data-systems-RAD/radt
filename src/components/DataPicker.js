import React from 'react';
import { url, headers } from '../utils';
import '../styles/DataPicker.css';

const endpoints = {
	"experiments": "fe_experiments",
	"runs": "fe_runs"
}

function Experiments(props) {
    return (
		<div id="experimentWrapper">
			{props.data.map(experiment => (
				<button
					key={experiment.id}
					className={props.activeExperimentId === experiment.id ? "active" : null}
					onClick= {() => props.onClickSetVisibleWorkloads(experiment.id)}
				>
					<span className="text">{experiment.name}</span>
				</button>
			))}
		</div>
	)
}
function Workloads(props) {
	return (
		<div id="workloadsWrapper"> 
		{props.data.slice().sort((a, b) => a - b).map(workload => (
			<div 
				key={workload}
				className={`workload ${props.activeWorkload === workload ? "active" : null}`}
				onClick={() => props.onClickSetVisibleRuns(workload)}
			>
				<div className="info">
					Workload {workload.substring(workload.indexOf("-") + 1) === "null" ? "N/A" : workload.substring(workload.indexOf("-") + 1)}
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
			{props.data.slice().sort((a, b) => a - b).map(run => (
				<button
					key={run.name}
					onClick={() => props.onClickToggleRunSelection(run.workload, run)}
				>
					<span className="text">Run {run.name.substring(0, 5)}</span>
					<div className="checkbox">{props.selectedRuns.includes(run.name) ? "X" : " "}</div>
				</button>
			))}
		</div>
	)
}
function Selections(props) {

	function testing(test) {
		return(
			<div>Hello {test}</div>
		)
	}

	return (
		<div id="selectionsWrapper">
			{props.selectedWorkloads.map(workload => (
				<div 
					className="selectedWorkload"
					key={workload}
				>
					<div className="showSelectedRunsBtn"></div>
					<div className="workloadName">{workload}</div>			
					<div className="selectedRuns">
						{testing("there")}
					</div>
				</div>
		))}
		</div>
	)
}

class DataPicker extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			isFetching: false,
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

	}

	/* select workload and render its runs to the runs component */
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
			visibleRuns: filteredRuns,
			activeWorkload: workload
		});
	}

	/* adds or removes runs and workloads to a selection array */
	toggleRunWorkloadSelection(workload, run = null) {

		const { selectedWorkloads, selectedRuns, runData } = this.state;
		let newSelectedWorkloads = [...selectedWorkloads];
		let newSelectedRuns = [...selectedRuns];

		if (run === null) {
			// add or remove all runs from one workload
			let workloadIndex = newSelectedWorkloads.indexOf(workload);
			if (workloadIndex === -1) {

				// add workload to selected
				newSelectedWorkloads.push(workload);

				// add all runs from this workload to selected
				runData.forEach(run => {
					if (run.workload === workload) {
						let runIndex = newSelectedRuns.indexOf(run.name);
						if (runIndex === -1) {
							newSelectedRuns.push(run.name);
						}
					}
				});
			}
			else {
				// remove workload from selected
				newSelectedWorkloads = selectedWorkloads.slice(0, workloadIndex).concat(selectedWorkloads.slice(workloadIndex + 1));	
				
				// remove all runs from this workload from selected
				runData.forEach(run => {	
					let runIndex = newSelectedRuns.indexOf(run.name);
					if (run.workload == workload && runIndex > -1) {
						newSelectedRuns = newSelectedRuns.slice(0, runIndex).concat(newSelectedRuns.slice(runIndex + 1));
					}
				});
			}
		}
		else {
			// add run amd its workload to selected runs and workloads
			let runIndex = selectedRuns.indexOf(run.name);
			if (runIndex === -1) {
				newSelectedRuns.push(run.name);
				let workloadIndex = newSelectedWorkloads.indexOf(run.workload);
				if (workloadIndex === -1) {
					newSelectedWorkloads.push(run.workload);
				}
			}
			else {
				// remove run from selected runs
				newSelectedRuns = newSelectedRuns.slice(0, runIndex).concat(newSelectedRuns.slice(runIndex + 1));

				// update selected workload list to reflect new selected runs
				newSelectedWorkloads = [];
				runData.forEach(run => {	
					let runIndex = newSelectedRuns.indexOf(run.name);
					if (runIndex > -1) {
						let workloadIndex = newSelectedWorkloads.indexOf(run.workload);
						if (workloadIndex === -1) {
							newSelectedWorkloads.push(run.workload);
						}
					}
				});
			}
		}

		this.setState({
			selectedWorkloads: newSelectedWorkloads,
			selectedRuns: newSelectedRuns
		});
	}

	renderTest(workload) {
		console.log(workload);
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
		} = this.state;
		return (
			<div id="dataPickerWrapper">
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
					selectedWorkloads={selectedWorkloads}
				/>
			</div>
		);
	}
}
export default DataPicker;
