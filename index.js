const Discord = require("discord.js");
const config = require("config");

const eventHandler = require("./events/eventHandler");
const  {saveData, readData, readDataSync} = require("./utility/dataHandler");
const {downloadRotation} = require("./utility/fetchRotation");
const {generateImage} = require("./rotation");

let servers = [];

const client = new Discord.Client();

//Initialization & Login
client.login(config.get("token"));

init();


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
client.on("guildCreate", eventHandler.onGuildCreate);
client.on("guildDelete", eventHandler)



async function init(){
    try {
        servers = readDataSync();

        await downloadRotation();

    } catch (err) {
        console.log("Failed to read server file: " + err);
    }
}