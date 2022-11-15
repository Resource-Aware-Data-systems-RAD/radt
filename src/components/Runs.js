import React from 'react';
import '../styles/Runs.css';

class Runs extends React.Component {
    render() {
        return (
            <div id="runsWrapper">
                {this.props.value.slice().sort((a, b) => a - b).map(run => (
                    <button
                        key={run.name}
                        onClick= {() => {
          
                        }}  
                    >
                    <span className="text">Run {run.name}</span>
                    </button>
                ))}
            </div>
        )
    }
}

export default Runs;