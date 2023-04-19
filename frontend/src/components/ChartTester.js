import React from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import '../styles/Chart.css';

class ChartTester extends React.Component {

    constructor(props) {
        super(props);

        // Highcharts security allowances
        Highcharts.AST.allowedTags.push('image');
        Highcharts.AST.allowedAttributes.push('xlink:href');
        Highcharts.AST.allowedAttributes.push('preserveAspectRatio');

        this.chartRef = React.createRef();

        let zoomButton;

        this.state = {
            chartOptions: {
                exporting: {
                    //width: 9999,
                    scale: 3,
                    sourceWidth: 1200,
                    sourceHeight: 800,
                    chartOptions: {
                        navigator: {
                            enabled: false       
                        },
                    }
                },
                boost: {
                    //useGPUTranslations: true
                },
                chart: {
                    type: "line",
                    zoomType: 'x',
                    events: {
                        selection: function(event) {
                            //console.log("selection");
                        }
                    }
                },
                legend: {
                    enabled: true
                },
                xAxis: {
                    events: {
                        setExtremes: function(event){
                            if (!zoomButton) {
                                const chart = this.chart;
                                zoomButton = chart.renderer.button('Reset Zoom', null, null, function(){
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
                                zoomButton.destroy();
                                zoomButton = null;
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
                        //rotation: 90
                     },
                    //tickInterval: 1000 * 60 * 60 * 24,
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
                        return  '</b>' + this.series.name +'</b><br/>X: ' + milliToMinsSecs(this.x) + '<br/>Y: ' + this.y;
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
                            enabled: false,
                            units: [[
                                //'millisecond', 
                                //[1] 
                            ]]
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
                        showInNavigator: false,    
                        //pointRange: 1000,
                        //lineWidth: 1,
                        point: {
                            events: {
                                //mouseOver: this.setHoverData.bind(this) // trigger this event on mouseover
                            }
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
                        }
                    },
                },
            },
            hoverData: null,
            eTest: null
        }
    }

    setHoverData(e) {    
        this.setState({ hoverData: e.target.category }); // chart is not updated because `chartOptions` has not changed 
    }

    getSeries() {
        // chart is updated only with new options

        let smoothing = 10;
        let model = "DCGMI - GPU Utilization";

        let parsedData = [];

        let combinedRunsTest = new Array();

        for (let i = 0; i < this.props.data.length; i++) {
            const dataSeries = this.props.data[i];            
            const emaSeries = calcEMA(dataSeries[model], smoothing);
            const parsedSeries = prepData(emaSeries, dataSeries["MSPast"]);
            parsedData.push({
                data: parsedSeries
                //name: 
            });


            // prep for testing combined runs
            let timeArray = dataSeries["MSPast"];
            let dataArray = dataSeries[model];
            for (let i = 0; i < timeArray.length; i++) {           
                combinedRunsTest.push([timeArray[i], dataArray[i]]);
            }
        }

        // make a merged series for testing combined runs
        combinedRunsTest.sort((a, b) => a[0] - b[0]);
        let combinedRunTimes = new Array();
        let combinedRunData = new Array();       
        combinedRunsTest.forEach(element => {
            //console.log(element[0] + " | " + element[1])
            combinedRunTimes.push(element[0]);
            combinedRunData.push(element[1]);      
        });
        const smoothedCombinedData = calcEMA(combinedRunData, 100);
        const parsedCombinedRuns = prepData(smoothedCombinedData, combinedRunTimes);
        parsedData.push({
            data: parsedCombinedRuns
        });

        console.log(parsedData);
        
        /*
        let data = [
            { 
                data: parsedData,
                id: 'run1',
                //visible: false
            },
            { 
                type: 'ema',
                params: {
                    period: 10
                },
                linkedTo: 'run1'
            }
        ];
        */

        this.setState({
            chartOptions: {
                title: {
                    text: model
                },
                series: parsedData,
                navigator: {
                    series: parsedData      
                },
            }
        });
    }

    testButton() {
        //console.log(this.chartRef);
        this.chartRef.current.chart.fullscreen.toggle();
    }

    componentDidMount() {
        this.getSeries();
    }

    render() {
        const { chartOptions, hoverData } = this.state;
        return (
            <div className="chartWrapper">
                {/*<h3>Hovering over {hoverData}</h3>*/}
                <HighchartsReact 
                    highcharts={Highcharts} 
                    constructorType='stockChart'
                    containerProps={{ className: 'chart' }}
                    options={chartOptions}         
                    ref={ this.chartRef }
                    //callback={chart => (this.chartRef.current = chart)}
                />
                {/*<button onClick={() => { this.getSeries() }}>Load</button>*/}
                {/*<button onClick={() => { this.testButton() }} >Fullscreen</button>*/}
            </div>
        );
    }
}

/********************************************************************** HELPER FUNCTIONS */

function milliToMinsSecs(ms) {
    /*
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    let label;
    if (seconds == 0) {
        label = minutes;
    }
    else if (seconds == 60) {         
        label = minutes + 1;
    }
    else if (seconds < 10) {
        label = minutes + ":0" + seconds;
    }
    else {
        label = minutes + ":" + seconds;
    }
    */

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

function calcEMA(mArray, mRange) {
    const k = 2/(mRange + 1);
    let emaArray = [mArray[0]];
    for (var i = 1; i < mArray.length; i++) {
        const emaResult = mArray[i] * k + emaArray[i - 1] * (1 - k);
        emaArray.push(emaResult.toFixed(4) * 1);
    }
    return emaArray;
}

function prepData(dataArray, timeArray) {
    if (timeArray.length != dataArray.length) {
        console.error("Time and data lengths don't match!");
    }
    let parsedData = [];
    for (let i = 0; i < timeArray.length; i++) {           
        parsedData.push([timeArray[i], dataArray[i]]);
    }
    return parsedData;
}

export default ChartTester;