import React from 'react';
import ChartTester from './ChartTester';

// load static data
import data_1 from '../data/test_12f6a';
import data_2 from '../data/test_11523';
import data_3 from '../data/test_7aa59';
import data_4 from '../data/test_e3052';
import data_5 from '../data/test_f1974';
import data_X from '../data/test_stress_09fda';

class LocalDataTest extends React.Component {

    constructor(props) {
        super(props);

        // pull data from iported json files
        let seriesData = [];
        seriesData.push(data_1);
        seriesData.push(data_2);
        //seriesData.push(data_3);
        //seriesData.push(data_4);
        seriesData.push(data_5);

        // extract DCGMI model names from json
        let seriesModels = [];
        Object.keys(seriesData[0]).forEach(key => {
            if (key.substring(0, 5) == "DCGMI") {
                seriesModels.push(key);
            }
        });

        this.state = {
            data: seriesData,
            models: seriesModels
        }
    }

    render() {
        return(
            <div id="container">
                <ChartTester data={this.state.data} />
            </div>
        )
    }
}

export default LocalDataTest;