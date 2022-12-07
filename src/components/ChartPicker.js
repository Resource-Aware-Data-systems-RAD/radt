import React from 'react';
import { HTTP } from '../api';
import '../styles/ChartPicker.css';

class ChartPicker extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			availableMetrics: [],
			selectedRunsData: [],
			showMetrics: false
		};
	}

	/* fetch all available metrics for the current selected runs */
	async fetchMetrics() {
		const selectedRuns = this.props.pushSelectedRuns;	
		const data = await HTTP.fetchMetrics(selectedRuns);
		this.setState({availableMetrics: data});
	}

	/* toggle metric list visibility */
	toggleMetrics() {
		const toShow = this.state.showMetrics;
		this.setState({ showMetrics: !toShow})
	}

	/* fetch all data for each run */
	async fetchSeriesData(metric) {
		const selectedRuns = this.props.pushSelectedRuns;
		const data = await HTTP.fetchSeriesData(selectedRuns, metric);

		data.forEach(series => {
			selectedRuns.forEach(run => {
				if (run.name === series.name) {			
					if (run.data === undefined) {
						run.data = [];
					}
					run.data.push({
						timestamp: series["timestamp"],
						value: series["value"],
						step: series["step"],
					});
				}
			});
		});
		this.generateWorkloadSeries(selectedRuns);
		this.setState({ selectedRunsData: selectedRuns });	
	}

	generateWorkloadSeries(runs) {

		let workloadSeries = [];

		runs.forEach(run => {
			run.data.forEach(series => {
				console.log(series);
			});
		});

		// TESTING: use 10-10 and 10-11
	}

	generateRunSeries() {

	}

	componentDidMount() {
		this.fetchMetrics(this.props.pushSelectedRuns);
	}

	componentDidUpdate(prevProps) {
		const toHide =  this.props.toHide;
		if (prevProps.toHide !== toHide) {
			const selectedRuns = this.props.pushSelectedRuns;
			this.fetchMetrics(selectedRuns);
		}
	}

	render() {
		const { availableMetrics, showMetrics } = this.state;
		return (
			<div
				id="chartPickerWrapper"
				className={this.props.toHide ? null : "hide"}
			>
				<button 
					id="pickChartBtn"
					onClick={() => this.toggleMetrics()}
				>
					+
				</button>
				<div 
					id="metricBtnList"
					className={showMetrics ? null : "hide"}
				>
					{availableMetrics.map(metric => (
						<button
							key={metric}
							className="metricBtn"
							onClick={() => this.fetchSeriesData(metric)}
						>
							{metric}
						</button>
					))}
				</div>
			</div>
		);
	}
}
export default ChartPicker;
