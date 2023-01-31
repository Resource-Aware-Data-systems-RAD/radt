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

	toggleDataPicker = (toShow) => {
		this.setState({ dataPickerOpen: toShow });
	}

	render() {  
		const { selectedRuns, dataPickerOpen } = this.state;
		return (   
			<div id="appWrapper">		
				<DataPicker 
					toHide={dataPickerOpen}
					pullSelectedRuns={this.updateSelectedRuns} 
					toggleDataPicker={this.toggleDataPicker}
				/>
				<ChartPicker 
					toHide={!dataPickerOpen}
					pushSelectedRuns={selectedRuns}
					toggleDataPicker={this.toggleDataPicker}
				/>
				{/*}<LocalDataTest />{*/}
			</div>
		);
	}
}
export default App;
