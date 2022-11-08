import React from 'react';
import '../styles/Experiments.css';

class Experiments extends React.Component {
    render() {
        return (
            <div id="container">
                {this.props.value.map(item => (
                    <button
                        key={item.experiment_id}
                        onClick= {() => this.props.onClick("runs", "?experiment_id=eq." + item.experiment_id)}      
                    >
                    <span className="text">{item.name}</span>
                    </button>
                ))}
            </div>
        )
    }
}

export default Experiments;