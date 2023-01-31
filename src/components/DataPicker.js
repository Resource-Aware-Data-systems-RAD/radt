import React, { useEffect, useRef } from 'react'
import { HTTP } from '../api';
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
		const data = await HTTP.fetchExperiments();
		this.setState({ experimentData: data });
	};

	/* fetch all runs */
	async fetchRuns() {
		const data = await HTTP.fetchRuns();
		this.setState({ runData: data });
	};

	/* select experiment and render its workloads to the workloads component */
	setVisibleWorkloads(experimentId) {
		const { runData } = this.state;
		let filteredWorkloads = [];
		for (let i = 0; i < runData.length; i++) {
			const run = runData[i];
			if (run.experimentId === experimentId) {
				if (filteredWorkloads.indexOf(run.workload) === -1) {
					filteredWorkloads.push(run.workload);
				}
			}
		}
		this.setState({
			visibleWorkloads: filteredWorkloads,
			visibleRuns: [],
			activeExperimentId: experimentId,
			activeWorkload: null
		});
	}

	/* select workload and render its runs to the runs component */
	setVisibleRuns(workload) {
		const { runData } = this.state;
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

		// five different ways the user can add/remove data to selection
		if (workload === "null" && run === null) {
			newSelectedRuns.forEach(run => {	
				if (run.workload.substring(run.workload.indexOf("-") + 1) === "null") {
					const runIndex = newSelectedRuns.findIndex(el => el.name === run.name);
					newSelectedRuns = newSelectedRuns.slice(0, runIndex).concat(newSelectedRuns.slice(runIndex + 1));
				}
			});
		}
		else if (run === null) {
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
					onClick={() => this.props.toggleDataPicker(false)}
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

	// format workload labels (handles unsorted runs with no workload)
	function formatWorkloadLabel(workload) {
		const workloadId = workload.substring(workload.indexOf("-") + 1);
		if (workloadId === "null") {
			workload = "Unsorted Runs";
		}
		else {
			workload = "Workload " + workload; 
		}
		return workload;
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
						{formatWorkloadLabel(workload)}
					</div>
					<div 
						className={`checkboxWrapper ${formatWorkloadLabel(workload) === "Unsorted Runs" ? "hide" : null}`}
					>
						<div 
							className="checkbox"
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
					{/*}<span className="text">Run {run.name.substring(0, 6)}</span>{*/}
					<span className="text">
						{run.letter} | {milliToMinsSecs(run.duration)}
					</span>
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
		bottomOfScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
	});

	// create new data object to render workloads and runs nicely in Selections
	let visibleSelection = [];
	props.selectedRuns.forEach(run => {

		let workload = run.workload;
		if (workload.substring(workload.indexOf("-") + 1) === "null") {
			workload = "null"
		}

		let workloadIndex = visibleSelection.findIndex(el => el.workload === workload);
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
				workload: workload,
				runs: runs
			})
		}
	});

	function formatWorkloadLabel(workload) {
		if (workload === "null") {
			workload = "Unsorted Runs";
		}
		else {
			workload = "Workload " + workload; 
		}
		return workload;
	}

	return (   
		<div id="selectionsWrapper">
			{ /* render all workloads */ }
			{visibleSelection.map(visibleWorkload => (
				<div
					className='workloadWrapper'
					key={visibleWorkload.workload}
				>
					<div className='workload'>
						{formatWorkloadLabel(visibleWorkload.workload)}
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

/* DataPicker helper functions */
function milliToMinsSecs(ms) {
    let label;
    let numOfDays = Math.trunc(ms / 86400000);
    if (numOfDays > 0) {
        label = numOfDays + "d " + new Date(ms).toISOString().slice(11, 19);
    }
    else {
        label = new Date(ms).toISOString().slice(11, 19);
    }
    return label;
}

export default DataPicker;