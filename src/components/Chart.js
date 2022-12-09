import React from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import '../styles/Chart.css';

// Highcharts security allowances
Highcharts.AST.allowedTags.push('image');
Highcharts.AST.allowedAttributes.push('xlink:href');
Highcharts.AST.allowedAttributes.push('preserveAspectRatio');

class Chart extends React.Component {

    constructor(props) {
		super(props);
		this.state = {
            chartOptions: [], 
            id: null,
            data: []
		};
	}

    componentDidMount() {
        const { chartData } = this.props;
        this.generateSeries(chartData.data);
        this.setState({
            id: chartData.id,
            data: chartData.data
        });
    }

    generateSeries(data) {

        console.log(data);

        let series = [];
        data.forEach(run => {   
            if (run.data !== undefined) {

                const workloadId = run.workload.substring(run.workload.indexOf("-") + 1);
                if (workloadId === "-1") {
                    run.workload = run.workload + "_" + run.name;
                }

                let seriesIndex = series.findIndex(series => series.id === run.workload);
                if (seriesIndex === -1) {                   
                    series.push({
                        id: run.workload,
                        data: []
                    });
                }
                else {
                    run.data.forEach(data => {
                        series[seriesIndex].data.push([data.timestamp, data.value]);
                    })
                }
                
            }
        });

        console.log(series);

    }

    render() {
        const { id, data } = this.state;
        return (
            <div className="chartWrapper">
                {id} | {data.length} runs
            </div>
        );
    }

}
export default Chart;