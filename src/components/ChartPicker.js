import React from 'react';
import { HTTP } from '../api';
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
	fetchMetrics() {
		const selectedRuns = this.props.pushSelectedRuns;	
		HTTP.fetchMetrics(selectedRuns).then((results) => {
			let uniqueMetrics = [];
			results.forEach(runMetrics => {
				runMetrics.forEach(metric => {
					let metricIndex = uniqueMetrics.indexOf(metric);
					if (metricIndex === -1) {
						uniqueMetrics.push(metric);
					}
				});
			});
			console.log("DONE!");
			this.setState({availableMetrics: uniqueMetrics.sort()});
		});
	}

	/* toggle metric list visibility */
	toggleMetrics() {
		const toShow = this.state.showMetrics;
		this.setState({ showMetrics: !toShow})
	}

	/* fetch all data for each run */
	fetchRunData(metric) {
		const selectedRuns = this.props.pushSelectedRuns;
		HTTP.fetchRunData(selectedRuns, metric).then((results) => {
			console.log(results);
		});
	}

	componentDidMount() {
		this.fetchMetrics(this.props.pushSelectedRuns);
	}

	componentDidUpdate(prevProps) {
		/*
		const selectedRuns = this.props.pushSelectedRuns;
		if (prevProps.pushSelectedRuns.length !== selectedRuns.length) {
			this.fetchMetrics(selectedRuns);
		}
		*/
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
							onClick={() => this.fetchRunData(metric)}
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
