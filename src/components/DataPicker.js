import React, { useEffect, useRef } from 'react'

import { HTTP, endpoints } from '../utils';

import '../styles/DataPicker.css';

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

	/* fetch all experiemnts */
	async fetchExperiments() {
		const experiments = await HTTP.fetchData(endpoints.experiments);
		let data = [];
		experiments.forEach(experiment => {
			data.push({
				"id": experiment["experiment_id"],
				"name": experiment["name"]
			})
		});
		this.setState({
			experimentData: data
		});
	};

	/* fetch all runs */
	async fetchRuns() {
		const runs = await HTTP.fetchData(endpoints.runs);
		let data = [];
		runs.forEach(run => {
			if (run["workload"] === null) {
				run["workload"] = 0;
			}
			let workloadId = run["experiment_id"] + "-" + run["workload"]
			data.push({
				"experimentId": run["experiment_id"],
				"name": run["run_uuid"],
				"duration": run["duration"],
				"startTime": run["start_time"],
				"source": run["data"],	
				"letter": run["letter"],
				"model": run["model"],
				"params": run["params"],
				"status": run["status"],
				"workload": workloadId,
			})
		});
		this.setState({
			runData: data
		});
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

		// pull copy of selected runs up to parent
		this.props.pullSelectedRuns(newSelectedRuns);
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
			<div 
				id="dataPickerWrapper"
				className={this.props.toHide ? null : "hide"}
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
					onClick={() => this.props.confirmSelection()}
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

	// sort workloads properly
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
function Selections(props) {

	// scroll to bottom of container when new props are added
	const bottomOfScrollRef = useRef(null);
	useEffect(() => {
		bottomOfScrollRef.current.scrollIntoView({ behavior: "smooth" });
	});

	// create new data object to render workloads and runs nicely in Selections
	let visibleSelection = [];
	props.selectedRuns.forEach(run => {
		let workloadIndex = visibleSelection.findIndex(el => el.workload === run.workload);
		if (workloadIndex > -1) {
			let runIndex = visibleSelection[workloadIndex].runs.findIndex(el => el.name === run.name);
			if (runIndex === -1) {
				visibleSelection[workloadIndex].runs.push(run);
			}           
		}
		else {
			let runs = [];
			runs.push(run);
			visibleSelection.push({
				workload: run.workload,
				runs: runs
			})
		}         
	});

	return (   
		<div 
			id="selectionsWrapper"
		>
			{ /* render all workloads */ }
			{visibleSelection.map(visibleWorkload => (
				<div
					className='workloadWrapper'
					key={visibleWorkload.workload}
				>
					<div className='workload'>
						Workload {visibleWorkload.workload}
						<button 
							className="removeBtn"
							onClick={() => props.onClickToggleWorkloadSelection(visibleWorkload.workload)}
						>
							X
						</button>
					</div>
					<ul>
					{ /* render all runs */ }
						{visibleWorkload.runs.sort((a, b) => a.startTime - b.startTime).map(visibleRun => (
							<li key={visibleRun.name}>
								{visibleRun.name.substring(0, 6)}
								<button 
									className="removeBtn"
									onClick={() => props.onClickToggleWorkloadSelection(visibleWorkload.workload, visibleRun)}
								>
									X
								</button>
							</li>
						))}
					</ul>
				</div>
			))}
			{ /* div ref to scroll to bottom of */ }
			<div ref={bottomOfScrollRef} /> 
		</div>
	);
}

export default DataPicker;
