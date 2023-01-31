import React from 'react';
import { HTTP } from '../api';
import Chart from './Chart';
import '../styles/ChartPicker.css';
import DataLogo from '../images/data.svg';
import LoadingIcon from '../images/cogwheel.svg';

class ChartPicker extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			loading: false,
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

		this.setState({ 
			loading: true,
			showMetrics: false
		});

		// deep clone run selections and fetch chart data for each run
		const chartRuns = structuredClone(this.props.pushSelectedRuns);
		const chartData = await HTTP.fetchChart(chartRuns, metric);

		// add the run data to the cloned run selections
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

		// grab the current chart data from the current state
		const { charts } = this.state;

		// add the new chart data to the state with a unique ID based on unix timestamp
		let newCharts = [...charts];
		const chartId = Date.now().toString();
		newCharts.push({ 
			id: chartId,
			data: chartRuns,
			metric: metric
		});

		// update chart state with new data
		this.setCharts(newCharts);
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
		let newCharts = [...this.state.charts].filter(chart => chart.id !== id);
		this.setCharts(newCharts);
	}

	setCharts(newChartData) {
		this.setState({
			charts: newChartData,
			loading: false,
		});

		localStorage.removeItem("localCharts");
		if (newChartData.length > 0) {
			const newChartsString = JSON.stringify(newChartData);
			localStorage.setItem("localCharts", newChartsString);



			/*
			console.log("ATTEMPTING TO SAVE");
			const blob = new Blob([newChartsString], {type: 'text/plain'});
			if(window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveBlob(blob, "test");
			}
			else{
				const elem = window.document.createElement('a');
				elem.href = window.URL.createObjectURL(blob);
				elem.download = "test";        
				document.body.appendChild(elem);
				elem.click();        
				document.body.removeChild(elem);
			}
			*/



		}
		else {
			this.props.toggleDataPicker(true);
		}
	}

	componentDidMount() {
		// fetch available metrics for any selected runs
		this.fetchMetrics(this.props.pushSelectedRuns);

		// check localSStorage for pre-existing chart data
		const localCharts = JSON.parse(localStorage.getItem("localCharts"))
		if (localCharts !== null) {
			this.setCharts(localCharts);
			this.props.toggleDataPicker(false);
			console.log("GET: charts loaded from localStorage");
		}
	}

	componentDidUpdate(prevProps) {
		const toHide =  this.props.toHide;
		if (prevProps.toHide !== toHide) {
			const selectedRuns = this.props.pushSelectedRuns;
			this.fetchMetrics(selectedRuns);
		}
	}

	render() {
		const { availableMetrics, showMetrics, charts, loading } = this.state;
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

				<button 
					id="pickChartBtn"
					onClick={() => this.toggleMetrics()}
					className={this.checkVisibility()}
					disabled={loading ? true : ""}
				>
					{loading ? <img src={LoadingIcon} className="loadingIcon" /> : "+"}
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

				{charts.sort((a, b) => b.id - a.id).map(chart => (
					<Chart 
						key={chart.id} 
						chartData={chart}
						removeChart={this.removeChart.bind(this)}
					/>
				))}
			</div>
		);
	}
}

export default ChartPicker;
