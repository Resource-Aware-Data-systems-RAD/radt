import React from 'react';
import { HTTP, endpoints } from '../api';
import '../styles/ChartPicker.css';

class ChartPicker extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			availableMetrics: [],
			showMetrics: false
		};
	}

	/* fetch all available metrics for the current selected runs */
	fetchMetrics(runs) {
		// make a list of all run names
		let runNames = runs.map(function (run) {
			return run.name;
		});

		// find out all the unique metrics available for each of these runs
		let availableMetrics = [];
		HTTP.fetchAllData(endpoints.metrics, runNames).then((results) => {
			results.forEach(runMetrics => {
				runMetrics.forEach(metrics => {
					let metricIndex = availableMetrics.indexOf(metrics.metric);
					if (metricIndex === -1) {
						availableMetrics.push(metrics.metric);
					}				
				});
			});
			this.setState({availableMetrics: availableMetrics.sort()});
		});
	}

	/* toggle metric list visibility */
	toggleMetrics() {
		const toShow = this.state.showMetrics;
		this.setState({ showMetrics: !toShow})
	}

	fetchData(metric) {

		// "https://res43.itu.dk/fe_metrics?run_uuid=eq.ee6e95e2ca594896a9964eaec22f3d46&key=eq.DCGMI+-+GR+Engine+Active"

		console.log(metric);

		const selectedRuns = this.props.pushSelectedRuns;
		const runNames = selectedRuns.map(function (run) {
			return run.name;
		});

		console.log(runNames);

		/*
		HTTP.fetchAllData(endpoints.data, runNames).then((results) => {

		});
		*/

	}

	componentDidMount() {
		this.fetchMetrics(this.props.pushSelectedRuns);
	}

	componentDidUpdate(prevProps) {
		const selectedRuns = this.props.pushSelectedRuns;
		if (prevProps.pushSelectedRuns.length !== selectedRuns.length) {
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
							onClick={() => this.fetchData(metric)}
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
