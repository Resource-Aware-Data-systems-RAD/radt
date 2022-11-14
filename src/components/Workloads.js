import React from 'react';
import '../styles/Workloads.css';

class Workloads extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeWorkload: null
        };
    }
    
    render() {
        return (
            <div id="workloadsWrapper">
                {this.props.value.slice().sort((a, b) => a - b).map(workload => (
                    <button
                        key={workload}
                        //onClick= {() => }  
                    >
                    <span className="text">Workload {workload}</span>
                    </button>
                ))}
            </div>
        )
    }
}

export default Workloads;