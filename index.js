const Discord = require("discord.js");
const config = require("config");

const eventHandler = require("./events/eventHandler");

const client = new Discord.Client();

//Initialization & Login
client.login(config.get("token"));

client.on("ready", ()=>{
    client.user.setPresence({
        status: "online", 
        activity: {
            name: "AW PVE rotations",
            type: "WATCHING",
        }
    });

    console.log("ready");
});

//Events
client.on("message", eventHandler.onMessage);