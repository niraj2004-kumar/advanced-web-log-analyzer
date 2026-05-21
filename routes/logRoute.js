const express = require("express");

const router = express.Router();

const multer = require("multer");

const fs = require("fs");

const Log = require("../models/log");

const isLoggedIn = require("../middleware/authMiddleware");

const investigate = require("../investigationEngine/rules/investigationEngine");


// =========================
// MULTER STORAGE
// =========================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, "uploads/");

    },

    filename: function (req, file, cb) {

        cb(null, Date.now() + "-" + file.originalname);

    }

});

const upload = multer({ storage: storage });


// =========================
// UPLOAD ROUTE
// =========================

router.post(
    "/upload",
    isLoggedIn,
    upload.single("logfile"),

    async (req, res) => {

        let success = 0;
        let redirect = 0;
        let clientError = 0;
        let serverError = 0;

        let ips = {};
        let ipErrors = {};
        let routes = {};
        let routeErrors = {};
        let methods = {};

        let maxIp = 0;
        let mostActive = "";

        if (!req.file) {

            return res.send("No file uploaded");

        }

        const filePath = req.file.path;

        fs.readFile(filePath, "utf-8", async (err, data) => {

            if (err) {

                return res.send("Error reading file");

            }

            const lines =
                data
                .split("\n")
                .filter(line => line.trim() !== "");

            const totalLines = lines.length;

            const selectedFormat = req.body.logFormat;

            const isApache =
                selectedFormat === "apache";

            let validEntries = 0;
            let invalidEntries = 0;


            // =========================
            // PARSER FUNCTION
            // =========================

            function parseLine(line) {

                if (isApache) {

                    const apacheRegex =
                        /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+)(?: \S+)?" (\d{3}) \S+/;

                    const match =
                        line.match(apacheRegex);

                    if (!match) return null;

                    return {

                        ip: match[1],

                        timestamp: match[2],

                        method: match[3],

                        route: match[4],

                        status: match[5]

                    };

                }

                else {

                    const parts =
                        line.trim().split(/\s+/);

                    if (parts.length < 4)
                        return null;

                    return {

                        ip: parts[0],

                        method: parts[1],

                        route: parts[2],

                        status: parts[3]

                    };

                }

            }


            // =========================
            // PROCESS LOGS
            // =========================
const parsedLogs = [];
            lines.forEach(line => {

                const parsed = parseLine(line);

                if (!parsed) {

                    invalidEntries++;

                    return;

                }


                const {
                    ip,
                    method,
                    route,
                    status
                } = parsed;
                parsedLogs.push(parsed);

validEntries++;

                // STATUS COUNT
                if (status.startsWith("2"))
                    success++;

                else if (status.startsWith("3"))
                    redirect++;

                else if (status.startsWith("4"))
                    clientError++;

                else if (status.startsWith("5"))
                    serverError++;

                // ROUTE COUNT
                routes[route] =
                    (routes[route] || 0) + 1;

                // METHOD COUNT
                methods[method] =
                    (methods[method] || 0) + 1;

                // IP COUNT
                ips[ip] =
                    (ips[ip] || 0) + 1;

                // ERROR TRACKING
                if (
                    status.startsWith("4") ||
                    status.startsWith("5")
                ) {

                    ipErrors[ip] =
                        (ipErrors[ip] || 0) + 1;

                    routeErrors[route] =
                        (routeErrors[route] || 0) + 1;

                }

            });

const threats = investigate(parsedLogs);


            // =========================
            // SUMMARY CALCULATIONS
            // =========================

            const totalRequests =
                validEntries;

            const errorCount =
                clientError + serverError;


            // MOST REQUESTED ROUTE

            let MostRequestedRoute = "";

            let maxRoute = 0;

            for (const [key, value]
                of Object.entries(routes)) {

                if (value > maxRoute) {

                    maxRoute = value;

                    MostRequestedRoute = key;

                }

            }


            // MOST ACTIVE IP

            for (const [key, value]
                of Object.entries(ips)) {

                if (value > maxIp) {

                    maxIp = value;

                    mostActive = key;

                }

            }


            // =========================
            // PARSER SUMMARY
            // =========================

            const parserSummary = {

                fileName:
                    req.file.originalname,

                parserMode:
                    isApache
                        ? "Apache"
                        : "Simple",

                totalLines,

                validEntries,

                invalidEntries,

                distinctRoutes:
                    Object.keys(routes).length,

                distinctIPs:
                    Object.keys(ips).length

            };


            // =========================
            // INSIGHTS
            // =========================

            const insights = [];

            insights.push(
                `Most active endpoint is ${MostRequestedRoute}`
            );

            insights.push(
                `Top traffic source is ${mostActive}`
            );


            // =========================
            // SUSPICIOUS ACTIVITY
            // =========================

            const suspiciousActivity = [];

            for (const [ip, count]
                of Object.entries(ips)) {

                if (count >= 15) {

                    suspiciousActivity.push(
                        `${ip} generated unusually high traffic with ${count} requests.`
                    );

                }

            }

            if (
                suspiciousActivity.length === 0
            ) {

                suspiciousActivity.push(
                    "No suspicious request concentration detected."
                );

            }


            // =========================
            // SAVE HISTORY
            // =========================

            await Log.create({

                userId: req.user.id,

                originalFileName:
                    req.file.originalname,

                uploadDate:
                    new Date(),

                logType:
                    selectedFormat,

                totalRequests:
                    totalRequests,

                errorCount:
                    errorCount,

                topRoute:
                    MostRequestedRoute

            });


            // =========================
            // SEND RESPONSE
            // =========================

            res.json({

                totalRequests,

                errorCount,

                success,

                redirect,

                clientError,

                serverError,

                Routes: routes,

                MostRequestedRoute,

                Method: methods,

                ips,

                mostActiveIP: mostActive,

                insights,

                parserSummary,

                suspiciousActivity,

                threats,

            });

        });

    }

);


// =========================
// HISTORY ROUTE
// =========================

router.get(
    "/history",
    isLoggedIn,

    async (req, res) => {

        try {

            const log_info =
                await Log.find({

                    userId:
                        req.user.id

                });

            res.json(log_info);

        }

        catch (error) {

            console.log(error);

            res.send(
                "Error fetching history"
            );

        }

    }

);


router.get("/delete_history/all", async(req,res)=>{

    try{

        const id = req.params.id;

        await Log.deleteMany({});

        res.json({
            message:"All records deleted"
        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({
            error:"Delete failed"
        });

    }

});

router.get("/delete_history/:id", async(req,res)=>{

    try{

        const id = req.params.id;

        await Log.findByIdAndDelete(id);

        res.json({
            message:"History deleted"
        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({
            error:"Delete failed"
        });

    }

});




module.exports = router;

