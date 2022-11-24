import React from 'react';
import DataPicker from './DataPicker';
import Selections from './Selections';
import '../styles/App.css';

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
		const { selectedRuns } = this.state;
		return (   
			<div>
				<DataPicker handleSelectedRuns={this.handleSelectedRuns} />
				<Selections 
					selectedRuns={selectedRuns}
				/>
			</div>
		);
	}
}
export default App;
