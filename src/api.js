const url = "https://res43.itu.dk/";
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicmVzdF91c2VyIn0.M16CO12bDsPscIJrQkBgbBwlOj73mBD_6Ws1CRPQwcw');

const filters = {
    metrics: "?run_uuid=eq."
}

export const endpoints = {
	experiments: "fe_experiments",
	runs: "fe_runs", 
    metrics: "fe_metrics_available",
    data: "fe_metrics"
}

export const HTTP = {

    fetchData: (endpoint, param = "") => {
        //console.log("Fetching... " + url + endpoint + param); // debugging
		return fetch(url + endpoint + param, { headers })
		.then(response => response.json())
		.then((json) => {
            let parsed = parseData(endpoint, json);
			return(parsed);
		})
		.catch((error) => {
			alert(error);
		})
    },

    fetchAllData: async(endpoint, parameters, filter) => {
        filter = endpoint === endpoints.metrics ? filters.metrics : "";
        return new Promise((resolve) => {
            let counter = 1;
            let total = parameters.length;
            let results = [];
            parameters.forEach(param => {
                HTTP.fetchData(endpoint, filter + param).then((json) => {              
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

function parseData(endpoint, json) {

    let parsed = [];
    json.forEach(data => {

        switch(endpoint) {

            /* experiments */
            case endpoints.experiments:          
                parsed.push({
                    "id": data["experiment_id"],
                    "name": data["name"]
                })
                break;
            
            /* runs */
            case endpoints.runs: 
                if (data["workload"] === null) {
                    data["workload"] = 0;
                }
                let workloadId = data["experiment_id"] + "-" + data["workload"];
                parsed.push({              
                    "name": data["run_uuid"],
                    "experimentId": data["experiment_id"],              
                    "duration": data["duration"],
                    "startTime": data["start_time"],
                    "source": data["data"],	
                    "letter": data["letter"],
                    "model": data["model"],
                    "params": data["params"],
                    "status": data["status"],
                    "workload": workloadId
                })
                break;

            /* metrics */
            case endpoints.metrics: 
                parsed.push({
                    "metric": data["key"]
                })
                break;

            /* do not parse */
            default: 
                parsed = json;
                break;

        }
    });
    return parsed;
}