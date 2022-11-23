import React from 'react';
import '../styles/Selections.css';

class Selections extends React.Component {

    constructor(props) {
		super(props);
		this.state = {
            visibleSelection: []
		};
	}

    /* run on initial component load (mostly for hot reload in dev) */
    componentDidMount() {
        this.parseSelectedRuns(this.props.selectedRuns);
	}

    /* runs once every time selectedRuns from props changes */
    componentDidUpdate(prevProps) {     
        if (this.props.selectedRuns.length !== prevProps.selectedRuns.length) {
            this.parseSelectedRuns(this.props.selectedRuns);
        }
    }
    
    /* takes the selected runs and parses them into a new array to render them */
    parseSelectedRuns(selectedRuns) {
        let newVisibleSelection = [];
        selectedRuns.forEach(run => {
            let workloadIndex = newVisibleSelection.findIndex(el => el.workload === run.workload);
            if (workloadIndex > -1) {
                let runIndex = newVisibleSelection[workloadIndex].runs.findIndex(el => el.name === run.name);
                if (runIndex === -1) {
                    newVisibleSelection[workloadIndex].runs.push(run);
                }           
            }
            else {
                let runs = [];
                runs.push(run);
                newVisibleSelection.push({
                    workload: run.workload,
                    runs: runs
                })
            }         
        });

        this.setState({
            visibleSelection: newVisibleSelection
        });
    }

    render() {  
        const { visibleSelection } = this.state;
        return (   
            <div id="selectionsWrapper">
                {visibleSelection.map(visibleWorkload => (
                    <div
                        className='workloadWrapper'
                        key={visibleWorkload.workload}
                    >
                        <div className='workload'>
                            Workload {visibleWorkload.workload}
                            <button 
                                className="removeBtn"
                                onClick={() => this.props.onClickToggleWorkloadSelection(visibleWorkload.workload)}
                            >
                                X
                            </button>
                        </div>
                        <ul>
                            {visibleWorkload.runs.sort((a, b) => a.startTime - b.startTime).map(visibleRun => (
                                <li key={visibleRun.name}>
                                    {visibleRun.name.substring(0, 6)}
                                    <button 
                                        className="removeBtn"
                                        onClick={() => this.props.onClickToggleWorkloadSelection(visibleWorkload.workload, visibleRun)}
                                    >
                                        X
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    }
}
export default Selections;