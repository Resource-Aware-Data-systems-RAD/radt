import React from 'react';

class Experiments extends React.Component {

    constructor(props) {
        super(props);
    }

    myClick(item) {
        console.log(item.experiment_id + " | " + item.name);
    }

    render() {
        return (
            <div id="container">
                {this.props.value.map(item => (
                    <button 
                        key={item.experiment_id}
                        onClick={() => this.myClick(item)} 
                    >
                    {item.name}
                    </button>
                ))}
            </div>
        )
    }
}

export default Experiments;