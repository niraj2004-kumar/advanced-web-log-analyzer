const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const port = 8080;


// DATABASE CONNECTION
require("./config/db");


// ROUTES
const authRoutes = require("./routes/authRoutes");
const logRoutes = require("./routes/logRoute");


// MIDDLEWARE
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


// USE ROUTES
app.use(authRoutes);
app.use(logRoutes);


// TEST ROUTE
app.get("/", (req, res) => {
    res.send("Server is running");
});


// SERVER
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});