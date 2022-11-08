import React from 'react';
import { url, headers } from '../utils';

import Experiments  from './Experiments';

import '../styles/App.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isFetching: false,
      experimentData: []
    };
  }

  fetchData(endpoint, param = "") {

    console.log("Fetching... " + url + endpoint + param);

    this.setState({isFetching: true});
    return fetch(url + endpoint + param, { headers })
    .then(response => response.json())
    .then((json) => {
        console.log(json); // debugging
        this.setState({isFetching: false});
        this.parseData(endpoint, json);
    })
    .catch((error) => {
        alert(error);    
    })
  };

  parseData(endpoint, json) {
    
    /****************************************** experiments endpoint */
    if (endpoint == "fe_experiments") {
      this.setState({
        experimentData: json
      });
    }

  };

  componentDidMount() {
    this.fetchData("fe_experiments");
  }

  render() {  
    const { experimentData } = this.state;
    return (   
      <Experiments 
        value={experimentData} 
        onClick={this.fetchData.bind(this)} 
      />
    );
  }
}

export default App;
