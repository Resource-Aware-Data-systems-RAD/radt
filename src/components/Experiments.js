import React from 'react';
import '../styles/Experiments.css';

class Experiments extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div id="experimentWrapper">
                {this.props.value.map(experiment => (
                    <button
                        key={experiment.id}
                        className={this.props.activeExperimentId === experiment.id ? "active" : null}
                        onClick= {() => this.props.onClick(experiment.id)}
                    >
                        <span className="text">{experiment.name}</span>
                    </button>
                ))}
            </div>
        )
    }
}

export default Experiments;