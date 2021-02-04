const express = require("express");
const config = require("config");
const path = require("path");

const app = express();
const port = process.env.PORT ? process.env.PORT : config.get("server.port");

app.listen(port, ()=>{
    console.log(`Express server up and listening on port ${port}`);
});

app.use("/data", express.static(path.join("data", "public")));
