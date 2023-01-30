import React from 'react';
import { useId, useState } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import '../styles/Chart.css';

class Chart extends React.Component {

    constructor(props) {
		super(props);
		this.state = {
            loading: true,
            id: null,
            data: [],
            smoothing: 0,
            options: {
                exporting: {
                    scale: 3,
                    sourceWidth: 1200,
                    sourceHeight: 800,
                    chartOptions: {
                        navigator: {
                            enabled: false       
                        },
                    }
                },
                chart: {
                    type: "line",
                    zoomType: 'x'
                },
                legend: {
                    enabled: true
                },
                xAxis: {
                    events: {
                        setExtremes: function(event){
                            if (!this.zoomButton) {
                                const chart = this.chart;
                                this.zoomButton = chart.renderer.button('Reset Zoom', null, null, function() {
                                    chart.xAxis[0].setExtremes(null, null);
                                }, {
                                    zIndex: 20
                                }).attr({
                                    id: 'resetZoom',
                                    align: 'right'
                                }).add().align({
                                    align: 'right',
                                    x: -15,
                                    y: 40
                                }, false, null);
                            }
                            if(!event.min && !event.max){
                                this.zoomButton.destroy();
                                this.zoomButton = null;
                            }
                        }
                    },
                    ordinal: false,
                    type: "datetime",
                    title: {
                        text: "Time"
                    },
                    labels:{
                        formatter:function(){
                            return (milliToMinsSecs(this.value))            
                        },
                     },
                },
                yAxis: {
                    opposite: false
                },
                credits: {
                    enabled: false
                },
                accessibility: {
                    enabled: false
                },
                tooltip: {
                    crosshairs: {
                        color: 'black',
                        dashStyle: '5'
                    },
                    shared: false,
                    split: false,
                    formatter: function() {
                        return  '<b>Series:</b>' + this.series.name +'<br/><b>Value:</b> ' + this.y + '<br/><b>Time:</b> ' + milliToMinsSecs(this.x);
                    }
                },
                navigator: {
                    xAxis: {
                        labels: {
                            enabled: false
                        }
                    },
                    height: 75,
                    enabled: true,
                    boostThreshold: 1,
                    series: {
                        dataGrouping: {
                            enabled: false
                        }
                    }        
                },
                rangeSelector: {
                    enabled: false
                },
                scrollbar: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        boostThreshold: 1,
                        marker: {
                            radius: 1
                        },       
                        states: {
                            hover: {
                                enabled: false,
                                halo: {
                                    size: 0
                                }
                            },
                            inactive: {
                                opacity: 1
                            }
                        },
                        dataGrouping: {
                            enabled: false,
                            units: [[
                                'millisecond', 
                                [1] 
                            ]]
                        },
                    },
                },
            },
		};    
        this.slider = React.createRef();
	}

    componentDidMount() {
        this.generateSeries(this.props.chartData, 0); // generate the initial state of the series
        this.slider.current.addEventListener('change', e => this.setSmoothness(e.target.value)); // ref to set smoothing only after user releases slider
    }

    generateSeries(chartData, smoothing) {

        let data = chartData.data;

        // format data into series for highcharts
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

        // subtract earliest time from all timestamps to get ms passed
        allSeries.forEach(series => {
            const earliestTime = series.data[0][0];
            series.data.forEach(timeAndValue => {
                timeAndValue[0] = timeAndValue[0] - earliestTime;
            });

            // add name
            series.name = series.id;

            // prevent duplicate ids in highcharts api
            delete series.id;
        });



        if (smoothing > 0) {
            //let test = calcEMA(allSeries[0].data, smoothing);

            allSeries.forEach(series => {
                series.data = calcEMA(series.data, smoothing);
            });
        }
        


        // update state which will update render of chart
        this.setState({
            id: chartData.id,
            data: chartData.data,
            options: {
                title: {
                    text: chartData.metric
                },
                series: allSeries,
                navigator: {
                    series: allSeries
                }
            },
            loading: false
        });
    }

    setSmoothness(smoothing) {
        console.log(smoothing);          
        this.generateSeries(this.props.chartData, smoothing);
        this.setState({
            smoothing: smoothing
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.loading !== this.state.loading) {
            //console.log("Finished!"); // debugging
        }
    }

    render() {
        const { options, id, smoothing } = this.state;
        return (
            <div className="chartWrapper">
                <button 
                    className="removeChartBtn"
                    onClick={() => this.props.removeChart(id)}
                >
                    X
                </button>
                <HighchartsReact 
                    highcharts={Highcharts} 
                    constructorType="stockChart"
                    containerProps={{className: "chart"}}
                    options={options}         
                    ref={ this.chartRef }
                />
                <div id="smootherWrapper">
                    <label htmlFor="smoother">Smoothness: </label>
                    <input ref={this.slider} defaultValue="0" type="range" name="smoother" min="0" max="100" /> {smoothing}
                </div>
            </div>
        );
    }

}

/* Chart component helper functions */
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
function calcEMA(series, smoothing) {


    smoothing = smoothing * 0.2;

    console.log(series);

    let time = series.map(a => a[0]); 
    let data = series.map(a => a[1]);
    
    let emaData = [data[0]];

    const k = 2 / (smoothing + 1);
    for (var i = 1; i < series.length; i++) {
        const emaResult = data[i] * k + emaData[i - 1] * (1 - k);
        emaData.push(emaResult.toFixed(4) * 1);
    }

    let parsedData = [];
    for (let i = 0; i < emaData.length; i++) {           
        parsedData.push([time[i], emaData[i]]);
    }
    
    console.log(parsedData);

    return parsedData;
}

export default Chart;