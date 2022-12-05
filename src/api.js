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

export const HTTP = {

    fetchData: (endpoint, param = "") => {
        console.log("GET: " + endpoint + param); // debugging
		return fetch(url + endpoint + param, { headers })
		.then(response => response.json())
		.then((json) => {
            return json;
		})
		.catch((error) => {
			alert(error);
		})
    },

    fetchExperiments: async (param = "") => {
        return new Promise((resolve) => {
            HTTP.fetchData(endpoints.experiments, param).then((json) => {            
                let parsed = [];
                json.forEach(data => { 
                    parsed.push({
                        "id": data["experiment_id"],
                        "name": data["name"]
                    })
                })        
                resolve(parsed);
            });
        });
    },

    fetchRuns: async (param = "") => {
        return new Promise((resolve) => {
            HTTP.fetchData(endpoints.runs,  param).then((json) => {   
                let parsed = [];
                json.forEach(data => { 
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
                })        
                resolve(parsed);
            });
        });
    },

    fetchMetrics: async(runs) => {
        if (runs.length > 0) {
            let param = "?run_uuid=in.(";
            runs.forEach(run => {
                param = param + '"' + run.name + '",';
            });
            param = param.substring(0, param.length - 1) + ")";       
            return new Promise((resolve) => {
                HTTP.fetchData(endpoints.metrics,  param).then((data) => {   
                    let uniqueMetrics = [];
                    data.forEach(metric => {                        
                        const metricIndex = uniqueMetrics.indexOf(metric.key);
                        if (metricIndex === -1) {
                            uniqueMetrics.push(metric.key);
                        }
                    });
                    resolve(uniqueMetrics.sort());
                });
            });
        }
        else {
            return [];
        }
    },

    fetchRunData: async(runs, metric) => {
        return new Promise((resolve) => {
            let [counter, total, results] = [1, runs.length, []];
            runs.forEach(run => {
                let params =  "?run_uuid=eq." + run.name + "&key=eq." + encodeURIComponent(metric);
                HTTP.fetchData(endpoints.data, params).then((json) => {              
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
