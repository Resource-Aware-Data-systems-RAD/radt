import React from 'react';
import DataPicker from './DataPicker';
import ChartPicker from './ChartPicker';
import '../styles/App.css';

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

		this.setState({ dataPickerOpen: false });

		
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
			</div>
		);
	}
}
export default App;
