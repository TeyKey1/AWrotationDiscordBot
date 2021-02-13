const express = require("express");
const config = require("config");
const path = require("path");
const {server} = require("./utility/logger");

const app = express();
const port = process.env.PORT ? process.env.PORT : config.get("server.port");

app.listen(port, ()=>{
    server.info(`Express server up and listening on port ${port}`);
});

app.use("/data", express.static(path.join("data", "public")));

//log and handle errors
app.use(errorLogger);

function errorLogger(err, req, res, next){
    server.error("Internal server error:", err);
    res.status(500).send({ error: "Something went wrong. Please try again later" });
}
