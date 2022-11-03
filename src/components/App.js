import React from 'react';

import '../styles/App.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    };

    this.renderCounter = 0;
  }

  componentDidMount() {

    fetch("https://res43.itu.dk/runs", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicmVzdF91c2VyIn0.M16CO12bDsPscIJrQkBgbBwlOj73mBD_6Ws1CRPQwcw",
      }
    })
      .then(res => res.json())
      .then(
        (results) => {

          console.log(results);

          this.setState({
            isLoaded: true,
            items: results
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {
    
    const { error, isLoaded, items, renderTimes} = this.state;

    this.renderCounter++;
    //console.log("Rendered " + this.renderCounter + " times!");

    if (error) {
      return <div>Error: {error.message}</div>;
    } 
    else if (!isLoaded) {
      return <div>Loading...</div>;
    } 
    else {
      /*
      return (   
        <ul>
          {items.map(item => (
            <li key={item.id}>
              {item.title} {item.body}
            </li>
          ))}
        </ul>       
      );
      */
    }
  }

}

export default App;
