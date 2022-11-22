import React from 'react';
import '../styles/Selections.css';

class Selections extends React.Component {

    constructor(props) {
		super(props);
		this.state = {
            visibleSelection: []
		};
	}

    componentDidUpdate(prevProps) {     
        if (this.props.selectedRuns.length !== prevProps.selectedRuns.length) {
            this.parseSelectedRuns(this.props.selectedRuns);
        }
    }
    
    parseSelectedRuns(selectedRuns) {

        console.log("Update visible runs!");
    
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
            
            this.setState({
                visibleSelection: newVisibleSelection
            });

        });
    }

    render() {  
        const { visibleSelection } = this.state;
        return (   
            <div id="selectionsWrapper">
            {visibleSelection.map(visibleWorkload => (
                <div>
                    {visibleWorkload.workload}
                    <ul>
                        {visibleWorkload.runs.map(visibleRun => (
                            <li>{visibleRun.name}</li>
                        ))}
                    </ul>
                </div>
            ))}
            </div>
        );
    }
}
export default Selections;