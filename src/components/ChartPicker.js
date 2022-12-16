import React from 'react';
import { HTTP } from '../api';
import Chart from './Chart';
import '../styles/ChartPicker.css';
import DataLogo from '../images/data.svg';

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
		const chartRuns = structuredClone(this.props.pushSelectedRuns);
		const chartData = await HTTP.fetchChart(chartRuns, metric);
		chartData.forEach(data => {	
			chartRuns.forEach(run => {
				if (run.name === data.name) {			
					if (run.data === undefined) {
						run.data = [];
					}
					run.data.push({
						timestamp: data.timestamp,
						value: data.value,
						step: data.step,
					});
				}
			});
		});
		const { charts } = this.state;
		let newCharts = [...charts];
		const chartId = Date.now().toString();
		newCharts.push({ 
			id: chartId,
			data: chartRuns,
			metric: metric
		});
		this.setState({ 
			charts: newCharts,
			showMetrics: false
		});
	}

	/* check if metrics button should be visible */
	checkVisibility() {
		const { availableMetrics } = this.state;
		if (availableMetrics.length === 0) {
			return "hide";
		}
		else if (!this.props.toHide) {
			return "hide"; 
		}
	}

	/* removes chart from state using its id */
	removeChart(id) {
		let newCharts = [...this.state.charts];
		this.setState({
			charts: newCharts.filter(chart => chart.id !== id)
		});
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
			>
				<button 
					id="dataLogo"
					onClick={() => this.props.toggleDataPicker(true)}
					className={this.props.toHide ? null : "hide"}
				>
					<img src={DataLogo} className="dataSVG" alt="Change Data" />
				</button>
				{charts.map(chart => (
					<Chart 
						key={chart.id} 
						chartData={chart}
						removeChart={this.removeChart.bind(this)}
					/>
				))}
				<button 
					id="pickChartBtn"
					onClick={() => this.toggleMetrics()}
					className={this.checkVisibility()}
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
