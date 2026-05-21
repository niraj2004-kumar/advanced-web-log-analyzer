const Threshold = 40;

function Route_scanning(parsedLogs){

    let Rs = {};
    let threats = [];

    parsedLogs.forEach(log => {

        if(!Rs[log.ip]){
            Rs[log.ip] = [];
        }

        if(!Rs[log.ip].includes(log.route)){
            Rs[log.ip].push(log.route);
        }

    });

    for(const [ip, routes] of Object.entries(Rs)){

        if(routes.length > Threshold){

            threats.push({
                type: "Route Scanning Attack",
                ip: ip,
                routesVisited: routes.length,
                severity: "HIGH",
                recommendation:"Restrict sensitive endpoints and monitor abnormal route exploration activity."
            });

        }

    }

    return threats;

}

module.exports = Route_scanning;