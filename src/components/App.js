import React from 'react';
import DataPicker from './DataPicker';
import ChartPicker from './ChartPicker';
import '../styles/App.css';

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedRuns: []
		};
	}

	updateSelectedRuns = (newSelectedRuns) => {
		this.setState({selectedRuns: newSelectedRuns});
	}

	submitSelectedRuns = () => {
		console.log(this.state.selectedRuns);

		
	} 

	render() {  
		return (   
			<div>
				<DataPicker 
					pushSelectedRuns={this.updateSelectedRuns} 
					confirmSelectedRuns={this.submitSelectedRuns}
				/>
				<ChartPicker />
			</div>
		);
	}
}
export default App;
