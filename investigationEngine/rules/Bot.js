const Threshold = 30;

function Bot(parsedLogs){

    let Bot = {};
    let threats = [];

    parsedLogs.forEach(log => {

        if(!Bot[log.ip]){
            Bot[log.ip] = [];
        }

        if(!Bot[log.ip].includes(log.route)){
            Bot[log.ip].push(log.route);
        }

    });

    for(const [ip, routes] of Object.entries(Bot)){

        if(routes.length > Threshold){

            threats.push({
                type: "Bot attack",
                ip: ip,
                routesVisited: routes.length,
                severity: "HIGH",
                recommendation:"Enable bot protection mechanisms and monitor repetitive automated behavior."
            });

        }

    }

    return threats;

}

module.exports = Bot;