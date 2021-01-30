const Discord = require("discord.js");
const config = require("config");
const schedule = require("node-schedule");

const eventHandler = require("./events/eventHandler");
const {downloadRotation} = require("./utility/fetchRotation");
const {scheduleUpdateTasks} = require("./scheduler/rotationsSchedule");
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

    console.log("Discord ready");
});

//Events
bot.on("message", eventHandler.onMessage);
bot.on("guildCreate", eventHandler.onGuildCreate);
bot.on("guildDelete", eventHandler.onGuildDelete);
bot.on("messageDelete", eventHandler.onMessageDelete);


async function init(){
    //Start webserver serving static files
    require("./server");
    
    try {
        loadGuilds();

        scheduleUpdateTasks(bot);
        scheduleRotationDownload();

        await downloadRotation();

    } catch (err) {
        console.log("Failed to read server file: " + err);
    }
}

function scheduleRotationDownload(){
    const rule = new schedule.RecurrenceRule();
    rule.minute = new schedule.Range(0, 59, 10);

    schedule.scheduleJob("Downolad Rotations", rule, async ()=>{
        await downloadRotation();
        console.log("Downolad Rotation task");
    });
}
