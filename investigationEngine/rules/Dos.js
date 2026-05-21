const Threshold = 40;

function Dos(parsedLogs){

    let suspiciousIPs = {};
    let threats = [];

    parsedLogs.forEach(log => {

        const key = log.ip + log.route;

        suspiciousIPs[key] =
            (suspiciousIPs[key] || 0) + 1;

    });

    for(const [key, requestCount] of Object.entries(suspiciousIPs)){

        if(requestCount > Threshold){

            threats.push({

                type: "Suspicious Bot Activity",

                source: key,

                repeatedRequests: requestCount,

                severity: "MEDIUM",
                recommendation:"Apply rate limiting and restrict excessive traffic from suspicious IP addresses."

            });

        }

    }

    return threats;

}

module.exports = Dos;