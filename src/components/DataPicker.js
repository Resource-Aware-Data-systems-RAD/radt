import React from 'react';
import { url, headers } from '../utils';
import Experiments  from './Experiments';

import '../styles/DataPicker.css';

let endpoints = {};
endpoints["experiments"] = "fe_experiments";
endpoints["runs"] = "fe_runs";

class DataPicker extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isFetching: false,
      experimentData: [],
      runData: []
    };
  }

  /* fetch all experiemnts or a specific experiment */
  fetchExperiments(param = "") {
    if (param == "") {
      this.fetchData(endpoints["experiments"]);    
    }
    else {
      this.fetchData(endpoints["experiments"], "?experiment_id=eq." + param);
    }
  }

  /* fetch all runs or a specific run */
  fetchRuns(param = "") {
    if (param == "") {
      this.fetchData(endpoints["runs"]);    
    }
    else {
      this.fetchData(endpoints["runs"], "?experiment_id=eq." + param);
    }
  }

  /* fetch data from relevant API endpoint */
  fetchData(endpoint, param = "") {
    console.log("Fetching... " + url + endpoint + param);
    this.setState({isFetching: true});
    return fetch(url + endpoint + param, { headers })
    .then(response => response.json())
    .then((json) => {
        console.log(json); // debugging
        this.setState({isFetching: false});
        this.parseDataAndSetState(endpoint, json);
    })
    .catch((error) => {
        alert(error);    
    })
  };

  /* parse data returned from endpoints into custom objects (if needed) and then apply to component state */
  parseDataAndSetState(endpoint, json) { 
    switch(endpoint) { 

      	/* experiments endpoint */
      	case endpoints["experiments"]: 
			this.setState({
				experimentData: json
			});
        	break;

      	/* experiments endpoint */
      	case endpoints["runs"]: 
			this.setState({
				runData: json
			});
			break;
      
		/* experiments endpoint */
      	default: 
        alert("Endpoint not recognised: " + endpoint);
        
    }
  };

  componentDidMount() {
    this.fetchExperiments();
    this.fetchRuns();
  }

  render() {  
    const { experimentData } = this.state;
    return (   
        <div id="dataPickerWrapper">
            <Experiments 
                value={experimentData} 
                onClick={this.fetchRuns.bind(this)} 
            />
        </div>
    );
  }
}

export default DataPicker;
