const express = require("express");
const config = require("config");

const app = express();
const port = config.get("server.port");

app.listen(port, ()=>{
    console.log(`Express server up and listening on port ${port}`);
});

app.use("/data", express.static("data"));
