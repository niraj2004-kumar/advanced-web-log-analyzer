const Bot = require("./Bot");
const bruteforceRule = require("./bruteforceRule");
const Dos = require("./Dos");
const Error_abuse = require("./Error_abuse");
const Routescanning = require("./Routescanning");

function investigate(parsedLogs){

    let allThreats = [];

    // Collect all threats
    allThreats.push(...bruteforceRule(parsedLogs));
    allThreats.push(...Bot(parsedLogs));
    allThreats.push(...Dos(parsedLogs));
    allThreats.push(...Error_abuse(parsedLogs));
    allThreats.push(...Routescanning(parsedLogs));

    // Remove duplicate threats
    const uniqueThreats = {};

    allThreats.forEach(threat => {

        const key =
            threat.type +
            "_" +
            (threat.ip || threat.source);

        if(!uniqueThreats[key]){

            uniqueThreats[key] = threat;

        }

        else{

            const current =
                uniqueThreats[key];

            const oldValue =
                current.requestCount ||
                current.routesVisited ||
                current.repeatedRequests ||
                current.attempts ||
                0;

            const newValue =
                threat.requestCount ||
                threat.routesVisited ||
                threat.repeatedRequests ||
                threat.attempts ||
                0;

            if(newValue > oldValue){

                uniqueThreats[key] = threat;

            }

        }

    });

    return Object.values(uniqueThreats);

}


module.exports = investigate;