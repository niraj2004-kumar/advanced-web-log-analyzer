const threshold = 30;

function bruteForce(parsedLogs){

    let suspiciousIPs = {};

    parsedLogs.forEach(log => {

        if(
            log.method === "POST" &&
            log.route === "/login" &&
            log.status.startsWith("4")
        ){

            suspiciousIPs[log.ip] =
                (suspiciousIPs[log.ip] || 0) + 1;

        }

    });

    const threats = [];

    for(const [ip, count] of Object.entries(suspiciousIPs)){

        if(count >= threshold){

            threats.push({
                type: "Brute Force Attack",
                ip: ip,
                attempts: count,
                severity: "HIGH",
                recommendation:"Enable CAPTCHA and temporarily block repeated failed login attempts."
            });

        }

    }

    return threats;

}

module.exports = bruteForce;