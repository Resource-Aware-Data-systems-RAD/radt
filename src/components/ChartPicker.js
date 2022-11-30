import React from 'react';
import { HTTP, endpoints } from '../utils';
import '../styles/ChartPicker.css';

class ChartPicker extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	fetchMetrics(runs) {

		let param = "?run_uuid=eq.";
		let runNames = runs.map(function (run) {
			return run.name;
		});

		HTTP.fetchAllData(endpoints.metrics, param, runNames).then((results) => {
			console.log(results);
		});

	}

	updateSelectedRuns = (newSelectedRuns) => {
		this.setState({selectedRuns: newSelectedRuns});
	}

	render() {
		const selectedRuns = this.props.pushSelectedRuns;
		return (
			<div
				id="chartPickerWrapper"
				className={this.props.toHide ? null : "hide"}
			>
				<button onClick={async() => {await this.fetchMetrics(selectedRuns);}}>+</button>
			</div>
		);
	}
}
export default ChartPicker;
