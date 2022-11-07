export const url = "https://res43.itu.dk/";
export const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicmVzdF91c2VyIn0.M16CO12bDsPscIJrQkBgbBwlOj73mBD_6Ws1CRPQwcw');

export const HTTP = {
   
    test_1: function (endpoint, param) {
        return fetch(url + endpoint, { headers })
        .then(response => response.json())
        .then((results) => {
            //console.log(results);
            return results;
        })
        .catch((error) => {
            //alert(error);
            console.error(error);      
        })
    },
      
    test_2: async function (endpoint, param) {
        const response = await fetch(url + endpoint, { headers });
        const json = await response.json();
        console.log(json);
    },
    
    test_3: async function (endpoint, param){
        let data = await (await (fetch(url + endpoint, { headers })
          .then(response => {
            return response.json()
          })
          .catch(error => {
            console.log(error)
          })
        ))
        return data;
    },

    test_4: function() {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicmVzdF91c2VyIn0.M16CO12bDsPscIJrQkBgbBwlOj73mBD_6Ws1CRPQwcw');
        return headers;
    }
       
};