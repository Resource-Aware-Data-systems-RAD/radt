const url = "https://res43.itu.dk/";
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicmVzdF91c2VyIn0.M16CO12bDsPscIJrQkBgbBwlOj73mBD_6Ws1CRPQwcw');

const endpoints = {
	experiments: "fe_experiments",
	runs: "fe_runs", 
    metrics: "fe_metrics_available",
    data: "fe_metrics"
}
const filters = {
    run: "run_uuid=eq.",
    metric: "key=eq."
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
                    data["workload"] = -1;
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
                parsed.push(
                    data["key"]
                )
                break;

            /* do not parse */
            default: 
                parsed = json;
                break;

        }
    });
    return parsed;
}

export const HTTP = {

    fetchData: (endpoint, param = "") => {
        console.log("GET: " + endpoint + param); // debugging
		return fetch(url + endpoint + param, { headers })
		.then(response => response.json())
		.then((json) => {
            let parsed = parseData(endpoint, json);
            console.log(parsed);
			return(parsed);
		})
		.catch((error) => {
			alert(error);
		})
    },

    fetchExperiments: async (param = "") => {
        return new Promise((resolve) => {
            HTTP.fetchData(endpoints.experiments,  param).then((data) => {   
                resolve(data);
            });
        });
    },

    fetchRuns: async (param = "") => {
        return new Promise((resolve) => {
            HTTP.fetchData(endpoints.runs,  param).then((data) => {   
                resolve(data);
            });
        });
    },

    fetchMetrics: async(runs) => {
        return new Promise((resolve) => {
            let [counter, total, results] = [1, runs.length, []];
            runs.forEach(run => {
                let params = "?" + filters.run + run.name;
                HTTP.fetchData(endpoints.metrics, params).then((json) => {   
                    results.push(json);           
                    if (counter === total) { 
                        resolve(results);
                    }
                    counter++;
                });
            });
        });
    },

    fetchRunData: async(runs, metric) => {
        return new Promise((resolve) => {
            let [counter, total, results] = [1, runs.length, []];
            runs.forEach(run => {
                let params =  "?" + filters.run + run.name + "&" + filters.metric + encodeURIComponent(metric);
                HTTP.fetchData(endpoints.data, params).then((json) => {              
                    results.push(json);          
                    if (counter === total) { 
                        resolve(results);
                    }
                    counter++;
                });
            });
        });
    },

}
