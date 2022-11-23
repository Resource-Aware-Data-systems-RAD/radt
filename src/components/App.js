import React from 'react';
import DataPicker from './DataPicker';

class App extends React.Component {

  constructor(props) {
		super(props);
		this.state = {
			selectedRuns: [],
		};
	}

  handleSelectedRuns = (newSelectedRuns) => {
    this.setState({selectedRuns: newSelectedRuns});
  }

  render() {  
    return (   
		  <DataPicker handleSelectedRuns={this.handleSelectedRuns} />
    );
  }
}
export default App;
