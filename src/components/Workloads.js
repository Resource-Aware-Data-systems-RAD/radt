import React from 'react';
import '../styles/Workloads.css';

class Workloads extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeWorkload: null
        };
    }

    setActiveWorkload(workload) {
        this.setState({ activeWorkload: workload });
    };
    
    render() {
        const { activeWorkload } = this.state;
        return (
            <div id="workloadsWrapper">
                {this.props.value.slice().sort((a, b) => a - b).map(workload => (
                    <button
                        key={workload}
                        className={activeWorkload === workload ? "active" : null}
                        onClick= {() =>  this.setActiveWorkload(workload)}  
                    >
                    <span className="text">Workload {workload}</span>
                    </button>
                ))}
            </div>
        )
    }
}

export default Workloads;