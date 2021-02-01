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


bot.on("ready", async ()=>{
    bot.user.setPresence({
        status: "online", 
        activity: {
            name: "AW PVE rotations",
            type: "WATCHING",
        }
    });

    console.log("Discord JS ready");

    await init();
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
    } catch (err) {
        console.log("Failed to load guild data: " + err);
        process.exit(1);
    }

    try{
        await downloadRotation();
    } catch (err) {
        console.log("Failed to download rotations on init: " + err);
    }

    scheduleUpdateTasks(bot);
    scheduleRotationDownload();

}

function scheduleRotationDownload(){
    const rule = new schedule.RecurrenceRule();
    rule.minute = new schedule.Range(0, 59, config.get("options.rotationFetchInterval"));

    schedule.scheduleJob("Downolad Rotations", rule, async ()=>{
        try {
            await downloadRotation();
            console.log("Downolad Rotation task");
        } catch (err) {
            console.log(`Failed to download rotations. Try again in ${config.get("options.rotationFetchInterval")}. ` + err);
        }
    });
}
