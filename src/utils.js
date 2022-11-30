const url = "https://res43.itu.dk/";
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicmVzdF91c2VyIn0.M16CO12bDsPscIJrQkBgbBwlOj73mBD_6Ws1CRPQwcw');

export const endpoints = {
	experiments: "fe_experiments",
	runs: "fe_runs", 
    metrics: "fe_metrics_available",
    data: "fe_metrics"
}

export const HTTP = {

    fetchData: (endpoint, param = "") => {
        console.log("Fetching... " + url + endpoint + param);
		return fetch(url + endpoint + param, { headers })
		.then(response => response.json())
		.then((json) => {
			return(json);
		})
		.catch((error) => {
			alert(error);
		})
    },
 
    fetchAllData: async(endpoint, param, fetches) => {
        return new Promise((resolve, reject) => {
            let counter = 1;
            let total = fetches.length;
            let results = [];
            fetches.forEach(fetch => {
                HTTP.fetchData(endpoint + param + fetch).then((json) => {              
                    results.push(json);           
                    if (counter === total) { 
                        resolve(results);
                    }
                    counter++;
                });
            });
        });
    }

}

// let randomTime = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
function waitFor(ms) {
    return function(x) {
      return new Promise(resolve => setTimeout(() => resolve(x), ms));
    }
};
