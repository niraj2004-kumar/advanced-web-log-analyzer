const threshold=40;


function Error_abuse(parsedLogs){
    let suspiciousip={}
    let error_counter=0;
    parsedLogs.forEach(log=>{
        if(log.status.startsWith("4") || log.status.startsWith("5")){
            suspiciousip[log.ip] =
                (suspiciousip[log.ip] || 0) + 1;

                error_counter++;
        }
    })

     const threats = [];
    for(const [ip, requestCount] of Object.entries(suspiciousip)){

        if(requestCount>threshold){

            threats.push({
                type: "Error abuse Attack",
                ip: ip,
                requestCount: requestCount,
                severity: "HIGH",
                recommendation:"Inspect repeated error-generating requests and validate incoming traffic properly."
            });

        }

    }

    return threats;
}

module.exports = Error_abuse;