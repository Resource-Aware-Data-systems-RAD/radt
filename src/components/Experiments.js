import React from 'react';
import '../styles/Experiments.css';

class Experiments extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeExperimentId: null
        };
    }
    
    setActiveExperimentId(id) {
        this.setState({ activeExperimentId: id });
    };

    render() {
        const { activeExperimentId } = this.state;
        return (
            <div id="experimentWrapper">
                {this.props.value.map(experiment => (
                    <button
                        className={activeExperimentId === experiment.Id ? "test" : null}   
                        key={experiment.id}            
                        onClick= {() => {
                            this.props.onClick(experiment.id);
                            this.setActiveExperimentId(experiment.id)
                        } }
                    >
                        <span className="text">{experiment.name}</span>
                    </button>
                ))}
            </div>
        )
    }
}

export default Experiments;