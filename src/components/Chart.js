import React from 'react';
import { useState, useEffect, useRef } from 'react';
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
	}

    componentDidMount() {
        this.generateSeries(this.props.chartData, 0); // generate the initial state of the series
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
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.loading !== this.state.loading) {
            //console.log("Finished!"); // debugging
        }
    }

    render() {
        const { options, id } = this.state;
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
                <Slider 
                    onSetSmoothness={this.setSmoothness.bind(this)}
                />
            </div>
        );
    }
}

class Slider extends React.Component { 
    constructor(props) {
		super(props);
		this.state = {
            smoothness: 0
        } 
        this.slider = React.createRef();
	}

    componentDidMount() {
        this.slider.current.addEventListener('change', e => this.props.onSetSmoothness(e.target.value));
    }

    render () {
        const { smoothness } = this.state;
        return (
            <div id="smootherWrapper">
                <label htmlFor="smoother">Smoothness: </label>
                <input ref={this.slider} onChange={e => this.setState({smoothness: e.target.value})} defaultValue="0" type="range" name="smoother" min="0" max="100" /> {smoothness}
            </div>
        )       
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
function calcEMA(series, range) {

    // UI smooth range is normalised between 1 and 100, which is high, so reduce
    range = range * 0.2;

    // separate data from timestamps
    let time = series.map(a => a[0]); 
    let data = series.map(a => a[1]);  

    // first item is just first data item
    let emaData = [data[0]]; 

    // apply smoothing according to range and add to new EMA array
    const k = 2 / (range + 1);    
    for (var i = 1; i < series.length; i++) {
        const emaResult = data[i] * k + emaData[i - 1] * (1 - k);
        emaData.push(emaResult.toFixed(4) * 1);
    }

    // recombine the new EMA array with the timestamp array
    let emaSeries = [];
    for (let i = 0; i < emaData.length; i++) {           
        emaSeries.push([time[i], emaData[i]]);
    }

    // return final series for highcharts API
    return emaSeries;
}

export default Chart;