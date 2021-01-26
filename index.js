const Discord = require("discord.js");
const config = require("config");

const eventHandler = require("./events/eventHandler");
const  {saveData, readData, readDataSync} = require("./utility/dataHandler");
const {downloadRotation} = require("./utility/fetchRotation");
const {generateImage} = require("./rotation");
const { loadGuilds } = require("./guild/guildHandler");

const bot = new Discord.Client();

//Initialization & Login
bot.login(config.get("token"));

init();


bot.on("ready", ()=>{
    bot.user.setPresence({
        status: "online", 
        activity: {
            name: "AW PVE rotations",
            type: "WATCHING",
        }
    });

    console.log("ready");
});

//Events
bot.on("message", eventHandler.onMessage);
bot.on("guildCreate", eventHandler.onGuildCreate);
bot.on("guildDelete", eventHandler.onGuildDelete);



async function init(){
    try {
        loadGuilds();

        await downloadRotation();

    } catch (err) {
        console.log("Failed to read server file: " + err);
    }
}

module.exports.bot = bot;