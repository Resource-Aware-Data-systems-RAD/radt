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

        let allSeries = [];
        data.forEach(run => {
            if (run.data !== undefined) {

                // check for unsorted runs
                let workloadId = run.workload;
                if (workloadId.substring(workloadId.indexOf("-") + 1) === "null") {
                    workloadId = workloadId + "-" + run.name;
                }

                // add all runs to one series per workload, unless they are unsorted runs
                let seriesIndex = allSeries.findIndex(series => series.id === workloadId);
                if (seriesIndex === -1) {                  
                    let newSeries = {
                        id: workloadId,
                        data: []
                    };
                    run.data.forEach(data => {
                        newSeries.data.push([data.timestamp, data.value]);
                    })
                    allSeries.push(newSeries);
                }
                else {
                    run.data.forEach(data => {
                        allSeries[seriesIndex].data.push([data.timestamp, data.value]);
                    })
                }

            }
        });       

        // sort all series by unix timestamp
        allSeries.forEach(series => {
            series.data.sort((a, b) => a[0] - b[0]);
        });

        // switch time to milliseconds from first timestamp
        allSeries.forEach(series => {
            const earliestTime = series.data[0][0];
            series.data.forEach(timeAndValue => {
                timeAndValue[0] = timeAndValue[0] - earliestTime;
            });
        });

        console.log(allSeries); /////////////////////////// best way to do this? 
        
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