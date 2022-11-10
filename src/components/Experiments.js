import React from 'react';
import '../styles/Experiments.css';

class Experiments extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeExperiment: null
        };
    }

    render() {
        return (
            <div id="experimentWrapper">
                {this.props.value.map(item => (
                    <button
                        key={item.experiment_id}
                        onClick= {() => this.props.onClick(item.experiment_id)}      
                    >
                    <span className="text">{item.name}</span>
                    </button>
                ))}
            </div>
        )
    }
}

export default Experiments;