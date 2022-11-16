import React from 'react';
import '../styles/Workloads.css';

class Workloads extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }
    
    render() {
        return (
            <div id="workloadsWrapper">
                {this.props.value.slice().sort((a, b) => a - b).map(workload => (
                    <button
                        key={workload}
                        className={this.props.activeWorkload === workload ? "active" : null}
                        onClick= {() => this.props.onClick(workload)}  
                    >
                    <span className="text">Workload {workload === "null" ? "N/A" : workload}</span>
                    </button>
                ))}
            </div>
        )
    }
}

export default Workloads;