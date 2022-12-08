import React from 'react';
import { HTTP } from '../api';
import Chart from './Chart';
import '../styles/ChartPicker.css';

class ChartPicker extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			availableMetrics: [],
			showMetrics: false,
			charts: []
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
	async fetchChart(metric) {
		const selectedRuns = this.props.pushSelectedRuns;
		const data = await HTTP.fetchChart(selectedRuns, metric);
		data.forEach(series => {
			selectedRuns.forEach(run => {
				if (run.name === series.name) {			
					if (run.data === undefined) {
						run.data = [];
					}
					run.data.push({
						timestamp: series.timestamp,
						value: series.value,
						step: series.step,
					});
				}
			});
		});
		const { charts } = this.state;
		let newCharts = [...charts];
		const chartId = Date.now().toString();
		newCharts.push({ 
			id: chartId,
			data: selectedRuns
		});
		this.setState({ charts: newCharts });
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
		const { availableMetrics, showMetrics, charts } = this.state;
		return (
			<div
				id="chartPickerWrapper"
				className={this.props.toHide ? null : "hide"}
			>
					{charts.map(chart => (
						<Chart 
							key={chart.id} 
							chartData={chart}
						/>
					))}

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
							onClick={() => this.fetchChart(metric)}
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
