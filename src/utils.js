const url = "https://res43.itu.dk/";
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicmVzdF91c2VyIn0.M16CO12bDsPscIJrQkBgbBwlOj73mBD_6Ws1CRPQwcw');

export const HTTP = {

    getExperiments: function (endpoint, param) {
        fetch(url + endpoint, { headers })
        .then(response => response.json())
        .then((results) => {
                console.log(results);
        })
        .catch((error) => {
              console.log("ERROR: " + error); // test this? 
        })
    },

    // how to set this to a component state? 
    
};