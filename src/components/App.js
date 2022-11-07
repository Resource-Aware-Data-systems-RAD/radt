import React from 'react';
import { url, headers, HTTP } from '../utils';

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

  fetchExperiments(endpoint, param) {
    this.setState({isFetching: true});
    return fetch(url + endpoint, { headers })
    .then(response => response.json())
    .then((json) => {

        console.log(json); // testing

        this.setState({
          experimentData: json, 
          isFetching: false
        });
    })
    .catch((error) => {
        alert(error);    
    })
  }


  componentDidMount() {

    this.fetchExperiments("fe_experiments");
  }

  render() {
    
    const { isFetching, experimentData } = this.state;

    if (isFetching) {
      return <div>Fetching!</div>;
    } 
    else {
      return (   

        <Experiments 
          value={experimentData} 
        />
      /*
      <div id="container">
        {data.map(item => (
            <button key={item.experiment_id}>
              {item.name}
            </button>
          ))}
      </div>
      */

      );
    }
  }

}

export default App;
