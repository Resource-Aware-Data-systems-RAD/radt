import React from 'react';
import DataPicker from './DataPicker';
import ChartPicker from './ChartPicker';
import '../styles/App.css';

import LocalDataTest from './LocalDataTest';

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedRuns: [],
			dataPickerOpen: true
		};
	}

	updateSelectedRuns = (newSelectedRuns) => {
		this.setState({selectedRuns: newSelectedRuns});
	}

	submitSelectedRuns = () => {
		if (this.state.selectedRuns.length > 0) {
			this.setState({ dataPickerOpen: false });	
		}
		else {
			alert("No data selected.")
		}
	}

	render() {  
		const { selectedRuns, dataPickerOpen } = this.state;
		return (   
			<div id="appWrapper">		
				<DataPicker 
					toHide={dataPickerOpen}
					pullSelectedRuns={this.updateSelectedRuns} 
					confirmSelection={this.submitSelectedRuns}
				/>
				<ChartPicker 
					toHide={!dataPickerOpen}
					pushSelectedRuns={selectedRuns}
				/>
				{/*}<LocalDataTest />{*/}
			</div>
		);
	}
}
export default App;
